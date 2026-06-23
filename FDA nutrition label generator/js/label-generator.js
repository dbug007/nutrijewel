// Label Generator
class LabelGenerator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.nutritionFacts = null;
    }

    // Update the nutrition label display
    updateLabel(nutritionFacts) {
        this.nutritionFacts = nutritionFacts;
        
        // Update serving information
        this.updateServingInfo();
        
        // Update calories
        this.updateCalories();
        
        // Update nutrients
        this.updateNutrients();
    }

    // Update serving information section
    updateServingInfo() {
        const servingsElement = this.container.querySelector('.servings-per-container');
        const servingSizeElement = this.container.querySelector('.serving-size');
        
        if (servingsElement) {
            const servings = this.nutritionFacts.servingsPerContainer;
            servingsElement.textContent = `${servings} serving${servings !== 1 ? 's' : ''} per container`;
        }
        
        if (servingSizeElement) {
            const size = this.formatServingSize(this.nutritionFacts.servingSize);
            const unit = this.nutritionFacts.servingUnit;
            servingSizeElement.innerHTML = `<strong>Serving size</strong> ${size} ${unit}${size !== '1' ? 's' : ''}`;
        }
    }

    // Format serving size for display
    formatServingSize(size) {
        // Remove trailing zeros and decimal point if not needed
        return parseFloat(size).toString();
    }

    // Update calories section
    updateCalories() {
        const caloriesElement = this.container.querySelector('.calories-value');
        if (caloriesElement) {
            caloriesElement.textContent = this.nutritionFacts.perServing.calories;
        }
    }

    // Update all nutrients
    updateNutrients() {
        this.updateNutrient('totalFat', 'Total Fat', 'g', true);
        this.updateNutrient('saturatedFat', 'Saturated Fat', 'g', true);
        this.updateNutrient('transFat', 'Trans Fat', 'g', false);
        this.updateNutrient('cholesterol', 'Cholesterol', 'mg', true);
        this.updateNutrient('sodium', 'Sodium', 'mg', true);
        this.updateNutrient('totalCarbs', 'Total Carbohydrate', 'g', true);
        this.updateNutrient('fiber', 'Dietary Fiber', 'g', true);
        this.updateNutrient('sugars', 'Total Sugars', 'g', false);
        this.updateNutrient('addedSugars', 'Added Sugars', 'g', true);
        this.updateNutrient('protein', 'Protein', 'g', false);
        this.updateNutrient('vitaminD', 'Vitamin D', 'mcg', true);
        this.updateNutrient('calcium', 'Calcium', 'mg', true);
        this.updateNutrient('iron', 'Iron', 'mg', true);
        this.updateNutrient('potassium', 'Potassium', 'mg', true);
    }

    // Update individual nutrient
    updateNutrient(nutrientKey, displayName, unit, showDailyValue) {
        const perServingValue = this.nutritionFacts.perServing[nutrientKey];
        const per100gValue = this.nutritionFacts.per100g[nutrientKey];
        const dailyValue = this.nutritionFacts.dailyValues[nutrientKey];

        // Find the nutrient row by searching for the display name
        const rows = this.container.querySelectorAll('.nutrient-row');
        let targetRow = null;

        rows.forEach(row => {
            const nameElement = row.querySelector('.nutrient-name');
            if (nameElement && nameElement.textContent.includes(displayName)) {
                targetRow = row;
            }
        });

        if (targetRow) {
            // Update per-100g amount (now 2nd column)
            const amount100gElement = targetRow.querySelector('.nutrient-amount-100g');
            if (amount100gElement) {
                amount100gElement.textContent = this.formatNutrientValue(per100gValue, unit);
            }

            // Update per-serving amount (now 3rd column)
            const amountElement = targetRow.querySelector('.nutrient-amount');
            if (amountElement) {
                amountElement.textContent = this.formatNutrientValue(perServingValue, unit);
            }

            // Update daily value (4th column)
            const dailyValueElement = targetRow.querySelector('.daily-value');
            if (dailyValueElement && showDailyValue && dailyValue !== undefined) {
                dailyValueElement.textContent = `${dailyValue}%`;
            }
        }

        // Special handling for Added Sugars (displayed differently)
        if (nutrientKey === 'addedSugars') {
            const addedSugarsRows = this.container.querySelectorAll('.nutrient-row.double-indent');
            addedSugarsRows.forEach(row => {
                const nameElement = row.querySelector('.nutrient-name');
                if (nameElement && nameElement.textContent.includes('Added Sugars')) {
                    // Update the text to show the amount
                    nameElement.textContent = `Includes ${this.formatNutrientValue(perServingValue, unit)} Added Sugars`;
                    
                    // Update per-100g amount (2nd column)
                    const amount100gElement = row.querySelector('.nutrient-amount-100g');
                    if (amount100gElement) {
                        amount100gElement.textContent = this.formatNutrientValue(per100gValue, unit);
                    }
                    
                    // Update daily value (4th column)
                    const dailyValueElement = row.querySelector('.daily-value');
                    if (dailyValueElement && showDailyValue && dailyValue !== undefined) {
                        dailyValueElement.textContent = `${dailyValue}%`;
                    }
                }
            });
        }
    }

    // Format nutrient value for display
    formatNutrientValue(value, unit) {
        let formattedValue;

        if (unit === 'mcg' && value < 1) {
            // Show one decimal place for values under 1 mcg
            formattedValue = value.toFixed(1);
        } else if (unit === 'mg' && value < 1) {
            // Show one decimal place for values under 1 mg
            formattedValue = value.toFixed(1);
        } else if (unit === 'g' && value < 1) {
            // Show one decimal place for values under 1 g
            formattedValue = value.toFixed(1);
        } else {
            // Show whole numbers for larger values
            formattedValue = Math.round(value).toString(); // Convert to string
        }

        // Remove trailing .0 (only if it's a string with decimal)
        if (typeof formattedValue === 'string' && formattedValue.endsWith('.0')) {
            formattedValue = formattedValue.slice(0, -2);
        }

        return `${formattedValue}${unit}`;
    }

    // Generate embed code
    generateEmbedCode() {
        const labelHTML = this.container.outerHTML;
        const cssLink = '<link rel="stylesheet" href="styles/nutrition-label.css">';
        
        return `${cssLink}\n${labelHTML}`;
    }

    // Get label element for export
    getLabelElement() {
        return this.container;
    }
}
