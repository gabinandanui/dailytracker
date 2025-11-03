// src/beverageData.js
export const beverageData = {
  "water": {
    name: "Water",
    icon: "💧",
    hydrationFactor: 1.0,
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0
    }
  },
  "tea": {
    name: "Tea",
    icon: "🍵",
    hydrationFactor: 0.85,
    nutrition: {
      calories: 16,
      protein: 0.4,
      carbs: 2.6,
      fats: 0.5,
      fiber: 0
    }
  },
  "coffee": {
    name: "Coffee",
    icon: "☕",
    hydrationFactor: 0.8,
    nutrition: {
      calories: 12,
      protein: 0.3,
      carbs: 2.0,
      fats: 0.2,
      fiber: 0
    }
  },
  "milk": {
    name: "Milk",
    icon: "🥛",
    hydrationFactor: 0.9,
    nutrition: {
      calories: 65,
      protein: 3.3,
      carbs: 4.8,
      fats: 3.7,
      fiber: 0
    }
  },
  "orange_juice": {
    name: "Orange Juice",
    icon: "🍊",
    hydrationFactor: 0.95,
    nutrition: {
      calories: 45,
      protein: 0.7,
      carbs: 10.4,
      fats: 0.2,
      fiber: 0.2
    }
  },
  "apple_juice": {
    name: "Apple Juice",
    icon: "🍎",
    hydrationFactor: 0.95,
    nutrition: {
      calories: 46,
      protein: 0.1,
      carbs: 11.3,
      fats: 0.1,
      fiber: 0.2
    }
  },
  "milkshake": {
    name: "Milkshake",
    icon: "🥤",
    hydrationFactor: 0.75,
    nutrition: {
      calories: 112,
      protein: 3.9,
      carbs: 17.0,
      fats: 3.9,
      fiber: 0.5
    }
  },
  "smoothie": {
    name: "Smoothie",
    icon: "🥤",
    hydrationFactor: 0.85,
    nutrition: {
      calories: 95,
      protein: 1.5,
      carbs: 21.0,
      fats: 0.9,
      fiber: 2.0
    }
  },
  "soda": {
    name: "Soda",
    icon: "🥤",
    hydrationFactor: 0.8,
    nutrition: {
      calories: 41,
      protein: 0,
      carbs: 10.6,
      fats: 0,
      fiber: 0
    }
  }
};

// Helper function to get nutrition for a specific volume
export function calculateBeverageNutrition(beverageType, volumeInMl) {
  const beverage = beverageData[beverageType.toLowerCase()];
  if (!beverage) return null;

  const scale = volumeInMl / 100; // nutrition values are per 100ml
  return {
    calories: Math.round(beverage.nutrition.calories * scale),
    protein: parseFloat((beverage.nutrition.protein * scale).toFixed(1)),
    carbs: parseFloat((beverage.nutrition.carbs * scale).toFixed(1)),
    fats: parseFloat((beverage.nutrition.fats * scale).toFixed(1)),
    fiber: parseFloat((beverage.nutrition.fiber * scale).toFixed(1))
  };
}