const fs = require('fs');
const path = require('path');
const vm = require('vm');

const apiKey = process.env.USDA_API_KEY;
if (!apiKey) {
    console.error('Error: USDA_API_KEY environment variable is not set.');
    process.exit(1);
}

const dataPath = path.join(__dirname, '../js/nutrition-data.js');
const sourcePath = path.join(__dirname, '../sources/nutrition-sources.json');
const reviewPath = path.join(__dirname, '../sources/usda-review.csv');
const missingPath = path.join(__dirname, '../sources/usda-missing.csv');

const raw = fs.readFileSync(dataPath, 'utf8');
const start = raw.indexOf('const NUTRITION_DATA =');
const end = raw.indexOf('const UNIT_CONVERSIONS');
if (start === -1 || end === -1) {
    console.error('Unable to locate NUTRITION_DATA in nutrition-data.js');
    process.exit(1);
}

const snippet = raw.slice(start, end).replace('const NUTRITION_DATA =', 'NUTRITION_DATA =');
const sandbox = { NUTRITION_DATA: null };
vm.runInNewContext(snippet, sandbox);
const NUTRITION_DATA = sandbox.NUTRITION_DATA || {};

const today = new Date().toISOString().slice(0, 10);

const sources = fs.existsSync(sourcePath)
    ? JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
    : { _meta: { generated: today, notes: 'Source map for nutrition facts.' } };

const DATA_TYPE_PREFERENCE = ['Foundation', 'SR Legacy'];
const STOP_WORDS = new Set([
    'and', 'or', 'with', 'without', 'raw', 'fresh', 'dried', 'dry', 'powder',
    'flour', 'seed', 'seeds', 'whole', 'ground', 'roasted', 'unsweetened',
    'sweetened', 'crushed', 'powdered', 'leaf', 'leaves'
]);

const SYNONYMS = {
    ragi: ['finger', 'millet'],
    bajra: ['pearl', 'millet'],
    jowar: ['sorghum'],
    makhana: ['fox', 'nut', 'foxnut', 'foxnuts', 'lotus', 'seed'],
    gond: ['edible', 'gum'],
    sattu: ['roasted', 'chickpea', 'flour'],
    ajwain: ['carom', 'seed'],
    jeera: ['cumin'],
    methi: ['fenugreek'],
    dhania: ['coriander']
};

function normalize(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function tokenize(text) {
    const tokens = normalize(text).split(/\s+/).filter(Boolean);
    return tokens;
}

function coreTokens(tokens) {
    const filtered = tokens.filter(token => !STOP_WORDS.has(token));
    return filtered.length ? filtered : tokens;
}

function expandTokens(tokens) {
    const expanded = new Set(tokens);
    for (const token of tokens) {
        const extra = SYNONYMS[token];
        if (extra) {
            extra.forEach(item => expanded.add(item));
        }
    }
    return Array.from(expanded);
}

function tokenOverlapScore(queryTokens, descTokens) {
    const querySet = new Set(queryTokens);
    const descSet = new Set(descTokens);
    let match = 0;
    for (const token of querySet) {
        if (descSet.has(token)) match++;
    }
    const ratio = querySet.size ? match / querySet.size : 0;
    return { match, ratio };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function searchUSDA(query) {
    const cleanQuery = query.replace(/\s*\([^)]*\)/g, '');
    const params = [
        `api_key=${apiKey}`,
        `query=${encodeURIComponent(cleanQuery)}`,
        `dataType=${encodeURIComponent(DATA_TYPE_PREFERENCE.join(','))}`,
        'pageSize=25'
    ];
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?${params.join('&')}`;

    const response = await fetchWithTimeout(url, 12000);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function fetchFoodDetails(fdcId) {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
    const response = await fetchWithTimeout(url, 12000);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

const NUTRIENT_NAME_MAP = {
    calories: ['Energy'],
    totalFat: ['Total lipid (fat)'],
    saturatedFat: ['Fatty acids, total saturated'],
    transFat: ['Fatty acids, total trans'],
    cholesterol: ['Cholesterol'],
    sodium: ['Sodium, Na'],
    totalCarbs: ['Carbohydrate, by difference'],
    fiber: ['Fiber, total dietary'],
    sugars: ['Sugars, total including NLEA', 'Sugars, total'],
    addedSugars: ['Sugars, added'],
    protein: ['Protein'],
    vitaminD: ['Vitamin D (D2 + D3)'],
    calcium: ['Calcium, Ca'],
    iron: ['Iron, Fe'],
    potassium: ['Potassium, K']
};

function buildNutrientList(food) {
    const list = [];
    if (Array.isArray(food.foodNutrients)) {
        for (const item of food.foodNutrients) {
            const name = item.nutrientName || (item.nutrient && item.nutrient.name);
            const unit = item.unitName || (item.nutrient && item.nutrient.unitName) || '';
            const value = item.amount ?? item.value;
            if (name && value !== undefined && value !== null) {
                list.push({ name, unit, value });
            }
        }
    }
    return list;
}

function findNutrient(list, names) {
    const targets = names.map(name => normalize(name));
    for (const entry of list) {
        if (targets.includes(normalize(entry.name))) {
            return { value: entry.value, unit: entry.unit };
        }
    }
    return { value: null, unit: '' };
}

function compareNutrients(local, usdaList) {
    const rows = [];
    for (const [field, names] of Object.entries(NUTRIENT_NAME_MAP)) {
        const localValue = local ? local[field] : null;
        const { value: usdaValue, unit } = findNutrient(usdaList, names);
        const delta = (usdaValue !== null && localValue !== null)
            ? usdaValue - localValue
            : null;
        const deltaPct = (delta !== null && localValue)
            ? (delta / localValue) * 100
            : null;
        const flags = [];
        if (usdaValue === null) flags.push('missing_usda');
        if (localValue === null || localValue === undefined) flags.push('missing_local');
        if (deltaPct !== null && Math.abs(deltaPct) >= 70) flags.push('large_delta');
        if (field === 'totalCarbs' && usdaValue === 0 && (localValue || 0) > 0) flags.push('zero_carbs');
        if (field === 'calories' && usdaValue !== null && localValue !== null && usdaValue < 50 && localValue > 200) {
            flags.push('calorie_drop');
        }
        if (field === 'sodium' && delta !== null && Math.abs(delta) > 500) flags.push('sodium_shift');

        rows.push({
            nutrient: field,
            localValue,
            usdaValue,
            unit,
            delta,
            deltaPct,
            flags
        });
    }
    return rows;
}

function scoreFood(food, queryTokens) {
    const descTokens = tokenize(food.description || '');
    const core = coreTokens(queryTokens);
    const expanded = expandTokens(core);
    const overlap = tokenOverlapScore(expanded, descTokens);
    const dataTypeIndex = DATA_TYPE_PREFERENCE.indexOf(food.dataType || '');
    const dataScore = dataTypeIndex === -1 ? 10 : dataTypeIndex;
    const score = overlap.ratio * 10 - dataScore;
    return { score, ratio: overlap.ratio };
}

function pickBestFood(foods, queryTokens) {
    if (!Array.isArray(foods) || foods.length === 0) return null;
    const ranked = foods.map(food => {
        const scoring = scoreFood(food, queryTokens);
        return { food, score: scoring.score, ratio: scoring.ratio };
    });
    ranked.sort((a, b) => b.score - a.score);
    return ranked[0] || null;
}

async function run() {
    const entries = Object.entries(NUTRITION_DATA).map(([key, value]) => ({
        key,
        name: value.name,
        brand: value.brand || 'Generic'
    }));

    console.log(`Starting USDA verification for ${entries.length} items...`);
    const reviewRows = [];
    const missingRows = [];

    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        if (i % 10 === 0) {
            console.log(`Progress: ${i}/${entries.length}`);
        }
        if (item.brand && item.brand !== 'Generic') {
            sources[item.key] = {
                sourceType: 'Label Required',
                sourceUrl: '',
                sourceDate: today,
                fdcId: '',
                dataType: '',
                status: 'needs_label',
                note: 'Branded item; verify via label or official source.'
            };
            await sleep(50);
            continue;
        }

        const tokens = tokenize(item.name);
        let searchResults;
        try {
            searchResults = await searchUSDA(item.name);
        } catch (err) {
            sources[item.key] = {
                sourceType: 'USDA FoodData Central',
                sourceUrl: '',
                sourceDate: today,
                fdcId: '',
                dataType: '',
                status: 'error',
                note: `USDA search error: ${err.message}`
            };
            continue;
        }

        const best = pickBestFood(searchResults.foods || [], tokens);
        if (!best) {
            sources[item.key] = {
                sourceType: 'USDA FoodData Central',
                sourceUrl: '',
                sourceDate: today,
                fdcId: '',
                dataType: '',
                status: 'no_match',
                note: 'No USDA Foundation/SR Legacy match.'
            };
            missingRows.push({ key: item.key, name: item.name, reason: 'no_match' });
            continue;
        }

        const bestFood = best.food;
        const confidence = best.ratio >= 0.7 ? 'high' : best.ratio >= 0.5 ? 'medium' : 'low';
        const status = confidence === 'high' ? 'needs_review' : 'low_confidence';
        const sourceUrl = `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${bestFood.fdcId}/nutrients`;

        let foodDetails;
        try {
            foodDetails = await fetchFoodDetails(bestFood.fdcId);
        } catch (err) {
            sources[item.key] = {
                sourceType: 'USDA FoodData Central',
                sourceUrl,
                sourceDate: today,
                fdcId: bestFood.fdcId,
                dataType: bestFood.dataType || '',
                status: 'error',
                note: `USDA detail error: ${err.message}`
            };
            missingRows.push({ key: item.key, name: item.name, reason: 'detail_error' });
            continue;
        }

        const nutrientList = buildNutrientList(foodDetails);
        const comparisons = compareNutrients(NUTRITION_DATA[item.key], nutrientList);

        for (const row of comparisons) {
            if (row.flags.length) {
                reviewRows.push({
                    key: item.key,
                    name: item.name,
                    fdcId: best.fdcId,
                    dataType: best.dataType || '',
                    nutrient: row.nutrient,
                    localValue: row.localValue,
                    usdaValue: row.usdaValue,
                    unit: row.unit,
                    deltaPct: row.deltaPct,
                    flags: row.flags.join('|')
                });
            }
        }

        sources[item.key] = {
            sourceType: 'USDA FoodData Central',
            sourceUrl,
            sourceDate: today,
            fdcId: bestFood.fdcId,
            dataType: bestFood.dataType || '',
            status,
            confidence,
            note: 'USDA candidate match; pending manual review.'
        };
        await sleep(250);
    }

    const reviewHeader = [
        'key','name','fdc_id','data_type','nutrient','local_value','usda_value','unit','delta_pct','flags'
    ].join(',');
    const reviewLines = [reviewHeader];
    for (const row of reviewRows) {
        const line = [
            row.key,
            row.name,
            row.fdcId,
            row.dataType,
            row.nutrient,
            row.localValue,
            row.usdaValue,
            row.unit,
            row.deltaPct,
            row.flags
        ].map(value => {
            const str = value === null || value === undefined ? '' : String(value);
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',');
        reviewLines.push(line);
    }

    const missingHeader = 'key,name,reason';
    const missingLines = [missingHeader];
    for (const row of missingRows) {
        const line = [row.key, row.name, row.reason].map(value => {
            const str = value === null || value === undefined ? '' : String(value);
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',');
        missingLines.push(line);
    }

    fs.writeFileSync(sourcePath, JSON.stringify(sources, null, 2));
    fs.writeFileSync(reviewPath, reviewLines.join('\n'));
    fs.writeFileSync(missingPath, missingLines.join('\n'));

    console.log(`Review rows: ${reviewRows.length}`);
    console.log(`Missing rows: ${missingRows.length}`);
}

run();
