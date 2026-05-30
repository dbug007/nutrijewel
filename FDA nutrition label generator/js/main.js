// Main Application Logic
// Global variables
let nutritionCalculator;
let labelGenerator;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Add initial ingredient input
    addIngredientInput();
});

function initializeApp() {
    // Initialize calculator and label generator
    nutritionCalculator = new NutritionCalculator();
    labelGenerator = new LabelGenerator('nutrition-label');
    
    // Set export handler label element
    exportHandler.setLabelElement(document.getElementById('nutrition-label'));
    
    // Initialize with default serving size
    updateServingDisplayOnly();
    
    // Load ingredient list for autocomplete
    setupIngredientAutocomplete();
}

function setupEventListeners() {
    // Add ingredient button
    document.getElementById('add-ingredient').addEventListener('click', addIngredientInput);
    
    // Calculate nutrition button
    document.getElementById('calculate-nutrition').addEventListener('click', calculateNutrition);
    
    // Reset form button
    document.getElementById('reset-form').addEventListener('click', resetForm);
    
    // Export buttons
    document.getElementById('export-png').addEventListener('click', handlePNGExport);
    document.getElementById('export-pdf').addEventListener('click', handlePDFExport);
    document.getElementById('get-embed-code').addEventListener('click', handleEmbedCode);
    document.getElementById('copy-embed-code').addEventListener('click', copyEmbedCode);
    
    // Serving size change listeners
    document.getElementById('serving-size').addEventListener('input', updateServingInfo);
    document.getElementById('serving-unit').addEventListener('change', updateServingInfo);
    document.getElementById('servings-per-container').addEventListener('input', updateServingInfo);
}

function addIngredientInput() {
    const ingredientsList = document.getElementById('ingredients-list');
    const index = ingredientsList.children.length;
    
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = `
        <h4>Ingredient ${index + 1}</h4>
        <div class="ingredient-controls">
            <input type="text" class="ingredient-search" placeholder="🔍 Search ingredients..." data-index="${index}">
            <select class="ingredient-select" data-index="${index}" required>
                <option value="">Select ingredient...</option>
                ${getIngredientOptions()}
            </select>
            <input type="number" class="ingredient-amount" placeholder="Amount" min="0" step="0.1" data-index="${index}" required>
            <select class="ingredient-unit" data-index="${index}">
                <option value="gram">gram</option>
                <option value="cup">cup</option>
                <option value="tablespoon">tablespoon</option>
                <option value="teaspoon">teaspoon</option>
                <option value="ounce">ounce</option>
                <option value="piece">piece</option>
                <option value="slice">slice</option>
            </select>
            <button type="button" class="btn btn-danger" onclick="removeIngredient(${index})">Remove</button>
        </div>
    `;
    
    ingredientsList.appendChild(ingredientItem);
    
    // Add event listeners for this ingredient
    const searchInput = ingredientItem.querySelector('.ingredient-search');
    const select = ingredientItem.querySelector('.ingredient-select');
    const amount = ingredientItem.querySelector('.ingredient-amount');
    const unit = ingredientItem.querySelector('.ingredient-unit');
    
    // Search filter
    searchInput.addEventListener('input', function(e) {
        filterIngredientOptions(select, e.target.value);
    });
    
    // Focus on select when clicking search
    searchInput.addEventListener('focus', function() {
        select.size = 8; // Show 8 options at once
    });
    
    searchInput.addEventListener('blur', function() {
        setTimeout(() => select.size = 1, 200); // Delay to allow selection
    });
    
    [select, amount, unit].forEach(element => {
        element.addEventListener('change', updateIngredientPreview);
    });
}

function getIngredientOptions() {
    const ingredients = getIngredientList();
    return ingredients.map(ingredient => 
        `<option value="${ingredient.id}">${ingredient.name}</option>`
    ).join('');
}

function filterIngredientOptions(selectElement, searchTerm) {
    const options = Array.from(selectElement.options);
    const searchLower = searchTerm.toLowerCase().trim();
    
    options.forEach((option, index) => {
        if (index === 0) return; // Keep the "Select ingredient..." option
        
        const text = option.textContent.toLowerCase();
        const matches = searchLower === '' || text.includes(searchLower);
        
        option.style.display = matches ? '' : 'none';
    });
    
    // Auto-select if only one match
    const visibleOptions = options.filter((opt, idx) => idx > 0 && opt.style.display !== 'none');
    if (visibleOptions.length === 1 && searchTerm.length > 2) {
        selectElement.value = visibleOptions[0].value;
        selectElement.dispatchEvent(new Event('change'));
    }
}

function removeIngredient(index) {
    const ingredientsList = document.getElementById('ingredients-list');
    const items = ingredientsList.children;
    
    if (items[index]) {
        items[index].remove();
        
        // Update indices for remaining items
        Array.from(items).forEach((item, newIndex) => {
            const controls = item.querySelectorAll('[data-index]');
            controls.forEach(control => {
                control.setAttribute('data-index', newIndex);
            });
            
            const header = item.querySelector('h4');
            header.textContent = `Ingredient ${newIndex + 1}`;
            
            const removeButton = item.querySelector('.btn-danger');
            removeButton.setAttribute('onclick', `removeIngredient(${newIndex})`);
        });
    }
}

function updateIngredientPreview() {
    // This could be enhanced to show a live preview as ingredients are added
    // For now, we'll just clear any previous calculation messages
    clearMessages();
}

function calculateNutrition() {
    try {
        // Clear previous calculation
        nutritionCalculator.clear();
        
        // Get serving information
        const servingSize = document.getElementById('serving-size').value;
        const servingUnit = document.getElementById('serving-unit').value;
        const servingsPerContainer = document.getElementById('servings-per-container').value;
        
        nutritionCalculator.setServingInfo(servingSize, servingUnit, servingsPerContainer);
        
        // Get ingredients
        const ingredientItems = document.querySelectorAll('.ingredient-item');
        let hasIngredients = false;
        
        ingredientItems.forEach((item, index) => {
            const select = item.querySelector('.ingredient-select');
            const amount = item.querySelector('.ingredient-amount');
            const unit = item.querySelector('.ingredient-unit');
            
            if (select.value && amount.value && parseFloat(amount.value) > 0) {
                nutritionCalculator.addIngredient(select.value, parseFloat(amount.value), unit.value);
                hasIngredients = true;
            }
        });
        
        if (!hasIngredients) {
            showMessage('Please add at least one ingredient with a valid amount.', 'error');
            return;
        }
        
        // Calculate and update label
        const nutritionFacts = nutritionCalculator.getNutritionFacts();
        labelGenerator.updateLabel(nutritionFacts);
        
        showMessage('Nutrition facts calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Calculation error:', error);
        showMessage('Error calculating nutrition facts: ' + error.message, 'error');
    }
}

function updateServingInfo() {
    // If nutrition has been calculated, recalculate with new serving info
    if (nutritionCalculator.ingredients.length > 0) {
        calculateNutrition();
    } else {
        // Just update the display if no ingredients yet
        updateServingDisplayOnly();
    }
}

function updateServingDisplayOnly() {
    // Get serving information from form
    const servingSize = document.getElementById('serving-size').value;
    const servingUnit = document.getElementById('serving-unit').value;
    const servingsPerContainer = document.getElementById('servings-per-container').value;
    
    // Update nutrition calculator with serving info
    nutritionCalculator.setServingInfo(servingSize, servingUnit, servingsPerContainer);
    
    // Update just the serving info display on the label
    const servingsElement = document.querySelector('.servings-per-container');
    const servingSizeElement = document.querySelector('.serving-size');
    
    if (servingsElement) {
        const servings = parseInt(servingsPerContainer);
        servingsElement.textContent = `${servings} serving${servings !== 1 ? 's' : ''} per container`;
    }
    
    if (servingSizeElement) {
        const size = parseFloat(servingSize).toString();
        servingSizeElement.innerHTML = `<strong>Serving size</strong> ${size} ${servingUnit}${size !== '1' ? 's' : ''}`;
    }
}

function resetForm() {
    // Clear form
    document.getElementById('recipe-name').value = '';
    document.getElementById('serving-size').value = '1';
    document.getElementById('serving-unit').value = 'cup';
    document.getElementById('servings-per-container').value = '1';
    
    // Clear ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    
    // Clear calculator
    nutritionCalculator.clear();
    
    // Reset label to default
    resetLabelToDefault();
    
    // Add one ingredient input
    addIngredientInput();
    
    // Hide embed code
    document.getElementById('embed-code-container').style.display = 'none';
    
    showMessage('Form reset successfully!', 'info');
}

function resetLabelToDefault() {
    // Reset all values to 0
    const defaultNutrition = {
        perServing: {
            calories: 0,
            totalFat: 0,
            saturatedFat: 0,
            transFat: 0,
            cholesterol: 0,
            sodium: 0,
            totalCarbs: 0,
            fiber: 0,
            sugars: 0,
            addedSugars: 0,
            protein: 0,
            vitaminD: 0,
            calcium: 0,
            iron: 0,
            potassium: 0
        },
        dailyValues: {
            totalFat: 0,
            saturatedFat: 0,
            cholesterol: 0,
            sodium: 0,
            totalCarbs: 0,
            fiber: 0,
            addedSugars: 0,
            vitaminD: 0,
            calcium: 0,
            iron: 0,
            potassium: 0
        },
        servingSize: 1,
        servingUnit: 'cup',
        servingsPerContainer: 1
    };
    
    labelGenerator.updateLabel(defaultNutrition);
}

// Export handlers
async function handlePNGExport() {
    try {
        showMessage('Generating PNG...', 'info');
        await exportHandler.exportPNG();
        showMessage('PNG downloaded successfully!', 'success');
    } catch (error) {
        console.error('PNG export error:', error);
        showMessage('Error generating PNG: ' + error.message, 'error');
    }
}

async function handlePDFExport() {
    try {
        showMessage('Generating PDF...', 'info');
        await exportHandler.exportPDF();
        showMessage('PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showMessage('Error generating PDF: ' + error.message, 'error');
    }
}

function handleEmbedCode() {
    try {
        const embedCode = exportHandler.generateEmbedCode();
        const textarea = document.getElementById('embed-code');
        textarea.value = embedCode;
        
        const container = document.getElementById('embed-code-container');
        container.style.display = 'block';
        
        showMessage('Embed code generated!', 'success');
    } catch (error) {
        console.error('Embed code error:', error);
        showMessage('Error generating embed code: ' + error.message, 'error');
    }
}

async function copyEmbedCode() {
    const textarea = document.getElementById('embed-code');
    const success = await exportHandler.copyToClipboard(textarea.value);
    
    if (success) {
        showMessage('Embed code copied to clipboard!', 'success');
    } else {
        showMessage('Failed to copy embed code. Please select and copy manually.', 'error');
    }
}

// Utility functions
function showMessage(text, type) {
    clearMessages();
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    const container = document.querySelector('.input-section');
    container.insertBefore(message, container.firstChild);
    
    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }
}

function clearMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => message.remove());
}

function setupIngredientAutocomplete() {
    // This could be enhanced with a proper autocomplete library
    // For now, ingredients are available in the dropdown select
    console.log('Ingredient database loaded with', Object.keys(NUTRITION_DATA).length, 'ingredients');
}
