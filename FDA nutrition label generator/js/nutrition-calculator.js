// Nutrition Calculator
class NutritionCalculator {
    constructor() {
        this.ingredients = [];
        this.servingSize = 1;
        this.servingUnit = 'cup';
        this.servingsPerContainer = 1;
    }

    // Add ingredient to recipe
    addIngredient(ingredientId, amount, unit) {
        if (!NUTRITION_DATA[ingredientId]) {
            throw new Error(`Ingredient ${ingredientId} not found in database`);
        }

        const ingredient = {
            id: ingredientId,
            name: NUTRITION_DATA[ingredientId].name,
            amount: parseFloat(amount),
            unit: unit,
            grams: convertToGrams(ingredientId, amount, unit)
        };

        this.ingredients.push(ingredient);
        return ingredient;
    }

    // Remove ingredient from recipe
    removeIngredient(index) {
        if (index >= 0 && index < this.ingredients.length) {
            this.ingredients.splice(index, 1);
        }
    }

    // Update ingredient
    updateIngredient(index, ingredientId, amount, unit) {
        if (index >= 0 && index < this.ingredients.length) {
            const ingredient = {
                id: ingredientId,
                name: NUTRITION_DATA[ingredientId].name,
                amount: parseFloat(amount),
                unit: unit,
                grams: convertToGrams(ingredientId, amount, unit)
            };
            this.ingredients[index] = ingredient;
        }
    }

    // Set serving information
    setServingInfo(size, unit, servingsPerContainer) {
        this.servingSize = parseFloat(size);
        this.servingUnit = unit;
        this.servingsPerContainer = parseInt(servingsPerContainer);
    }

    // Calculate total nutrition for entire recipe
    calculateTotalNutrition() {
        const totals = {
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
        };

        this.ingredients.forEach(ingredient => {
            const nutritionData = NUTRITION_DATA[ingredient.id];
            const ratio = ingredient.grams / 100; // nutrition data is per 100g

            // Add up all nutrients
            Object.keys(totals).forEach(nutrient => {
                totals[nutrient] += nutritionData[nutrient] * ratio;
            });
        });

        return totals;
    }

    // Calculate nutrition per serving
    calculatePerServing() {
        const totals = this.calculateTotalNutrition();
        const perServing = {};

        // Divide by servings per container
        Object.keys(totals).forEach(nutrient => {
            perServing[nutrient] = totals[nutrient] / this.servingsPerContainer;
        });

        return perServing;
    }

    // Calculate nutrition per 100g
    calculatePer100g() {
        const totals = this.calculateTotalNutrition();
        const totalWeight = this.getTotalWeight(); // Total weight of all ingredients in grams
        const per100g = {};

        if (totalWeight > 0) {
            // Calculate nutrients per 100g
            Object.keys(totals).forEach(nutrient => {
                per100g[nutrient] = (totals[nutrient] / totalWeight) * 100;
            });
        } else {
            // If no weight, return zeros
            Object.keys(totals).forEach(nutrient => {
                per100g[nutrient] = 0;
            });
        }

        return per100g;
    }

    // Get total weight of all ingredients
    getTotalWeight() {
        return this.ingredients.reduce((total, ingredient) => {
            return total + ingredient.grams;
        }, 0);
    }

    // Calculate daily value percentages
    calculateDailyValues(nutrition) {
        const dailyValues = {};

        Object.keys(FDA_DAILY_VALUES).forEach(nutrient => {
            if (nutrition[nutrient] !== undefined && FDA_DAILY_VALUES[nutrient]) {
                dailyValues[nutrient] = (nutrition[nutrient] / FDA_DAILY_VALUES[nutrient]) * 100;
            }
        });

        return dailyValues;
    }

    // Apply FDA rounding rules
    applyFDARounding(nutrition) {
        const rounded = {};

        // Calories: round to nearest 5 if under 50, nearest 10 if over 50
        if (nutrition.calories < 5) {
            rounded.calories = 0;
        } else if (nutrition.calories <= 50) {
            rounded.calories = Math.round(nutrition.calories / 5) * 5;
        } else {
            rounded.calories = Math.round(nutrition.calories / 10) * 10;
        }

        // Total Fat: round to nearest 0.5g if under 5g, nearest 1g if over 5g
        if (nutrition.totalFat < 0.5) {
            rounded.totalFat = 0;
        } else if (nutrition.totalFat < 5) {
            rounded.totalFat = Math.round(nutrition.totalFat * 2) / 2;
        } else {
            rounded.totalFat = Math.round(nutrition.totalFat);
        }

        // Saturated Fat: round to nearest 0.5g if under 5g, nearest 1g if over 5g
        if (nutrition.saturatedFat < 0.5) {
            rounded.saturatedFat = 0;
        } else if (nutrition.saturatedFat < 5) {
            rounded.saturatedFat = Math.round(nutrition.saturatedFat * 2) / 2;
        } else {
            rounded.saturatedFat = Math.round(nutrition.saturatedFat);
        }

        // Trans Fat: round to nearest 0.5g
        if (nutrition.transFat < 0.5) {
            rounded.transFat = 0;
        } else {
            rounded.transFat = Math.round(nutrition.transFat * 2) / 2;
        }

        // Cholesterol: round to nearest 5mg
        if (nutrition.cholesterol < 2) {
            rounded.cholesterol = 0;
        } else if (nutrition.cholesterol <= 5) {
            rounded.cholesterol = 5;
        } else {
            rounded.cholesterol = Math.round(nutrition.cholesterol / 5) * 5;
        }

        // Sodium: round to nearest 5mg if under 140mg, nearest 10mg if over 140mg
        if (nutrition.sodium < 5) {
            rounded.sodium = 0;
        } else if (nutrition.sodium <= 140) {
            rounded.sodium = Math.round(nutrition.sodium / 5) * 5;
        } else {
            rounded.sodium = Math.round(nutrition.sodium / 10) * 10;
        }

        // Total Carbohydrates: round to nearest 1g
        if (nutrition.totalCarbs < 0.5) {
            rounded.totalCarbs = 0;
        } else {
            rounded.totalCarbs = Math.round(nutrition.totalCarbs);
        }

        // Dietary Fiber: round to nearest 1g
        if (nutrition.fiber < 0.5) {
            rounded.fiber = 0;
        } else {
            rounded.fiber = Math.round(nutrition.fiber);
        }

        // Sugars: round to nearest 1g
        if (nutrition.sugars < 0.5) {
            rounded.sugars = 0;
        } else {
            rounded.sugars = Math.round(nutrition.sugars);
        }

        // Added Sugars: round to nearest 1g
        if (nutrition.addedSugars < 0.5) {
            rounded.addedSugars = 0;
        } else {
            rounded.addedSugars = Math.round(nutrition.addedSugars);
        }

        // Protein: round to nearest 1g
        if (nutrition.protein < 0.5) {
            rounded.protein = 0;
        } else {
            rounded.protein = Math.round(nutrition.protein);
        }

        // Vitamin D: round to nearest 0.1mcg if under 1mcg, nearest 1mcg if over 1mcg
        if (nutrition.vitaminD < 0.1) {
            rounded.vitaminD = 0;
        } else if (nutrition.vitaminD < 1) {
            rounded.vitaminD = Math.round(nutrition.vitaminD * 10) / 10;
        } else {
            rounded.vitaminD = Math.round(nutrition.vitaminD);
        }

        // Calcium: round to nearest 10mg if under 100mg, nearest 50mg if over 100mg
        if (nutrition.calcium < 10) {
            rounded.calcium = 0;
        } else if (nutrition.calcium <= 100) {
            rounded.calcium = Math.round(nutrition.calcium / 10) * 10;
        } else {
            rounded.calcium = Math.round(nutrition.calcium / 50) * 50;
        }

        // Iron: round to nearest 0.1mg if under 1mg, nearest 1mg if over 1mg
        if (nutrition.iron < 0.1) {
            rounded.iron = 0;
        } else if (nutrition.iron < 1) {
            rounded.iron = Math.round(nutrition.iron * 10) / 10;
        } else {
            rounded.iron = Math.round(nutrition.iron);
        }

        // Potassium: round to nearest 10mg if under 100mg, nearest 50mg if over 100mg
        if (nutrition.potassium < 10) {
            rounded.potassium = 0;
        } else if (nutrition.potassium <= 100) {
            rounded.potassium = Math.round(nutrition.potassium / 10) * 10;
        } else {
            rounded.potassium = Math.round(nutrition.potassium / 50) * 50;
        }

        return rounded;
    }

    // Round daily value percentages
    roundDailyValues(dailyValues) {
        const rounded = {};

        Object.keys(dailyValues).forEach(nutrient => {
            const value = dailyValues[nutrient];
            if (value < 1) {
                rounded[nutrient] = 0;
            } else {
                rounded[nutrient] = Math.round(value);
            }
        });

        return rounded;
    }

    // Get complete nutrition facts
    getNutritionFacts() {
        const perServing = this.calculatePerServing();
        const per100g = this.calculatePer100g();
        const rounded = this.applyFDARounding(perServing);
        const rounded100g = this.applyFDARounding(per100g);
        const dailyValues = this.calculateDailyValues(perServing);
        const roundedDailyValues = this.roundDailyValues(dailyValues);

        return {
            perServing: rounded,
            per100g: rounded100g,
            dailyValues: roundedDailyValues,
            servingSize: this.servingSize,
            servingUnit: this.servingUnit,
            servingsPerContainer: this.servingsPerContainer,
            totalWeight: this.getTotalWeight()
        };
    }

    // Clear all ingredients
    clear() {
        this.ingredients = [];
    }
}

// Global calculator instance
window.nutritionCalculator = new NutritionCalculator();
