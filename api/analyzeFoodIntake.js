// api/analyzeFoodIntake.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Static nutrition database (from your foodData.js + CSV data)
const NUTRITION_DB = {
  "aloo sabji": {
    name: "Aloo Sabji",
    category: "Vegetables",
    measurements: {
      "katori": {
        calories: 132,
        protein: 2.8,
        carbs: 18,
        fats: 6,
        fiber: 2.4,
      },
      "grams": {
        caloriesPerGram: 0.88,
        proteinPerGram: 0.019,
        carbsPerGram: 0.12,
        fatsPerGram: 0.04,
        fiberPerGram: 0.016,
      },
    },
  },
  "chapati": {
    name: "Roti/Chapati",
    category: "Breads",
    measurements: {
      "piece": {
        calories: 102,
        protein: 3.6,
        carbs: 18,
        fats: 1.2,
        fiber: 2.5,
      },
    },
  },
  "chicken curry": {
    name: "Chicken Curry",
    category: "Non-Vegetarian",
    measurements: {
      "katori": {
        calories: 185,
        protein: 22,
        carbs: 8,
        fats: 8,
        fiber: 1.5,
      },
      "grams": {
        caloriesPerGram: 1.23,
        proteinPerGram: 0.147,
        carbsPerGram: 0.053,
        fatsPerGram: 0.053,
        fiberPerGram: 0.01,
      },
    },
  },
  "curry": {
    name: "Chicken Curry",
    category: "Non-Vegetarian",
    measurements: {
      "katori": {
        calories: 185,
        protein: 22,
        carbs: 8,
        fats: 8,
        fiber: 1.5,
      },
      "grams": {
        caloriesPerGram: 1.23,
        proteinPerGram: 0.147,
        carbsPerGram: 0.053,
        fatsPerGram: 0.053,
        fiberPerGram: 0.01,
      },
    },
  },
  "dal": {
    name: "Dal Tadka",
    category: "Lentils",
    measurements: {
      "katori": {
        calories: 150,
        protein: 7,
        carbs: 20,
        fats: 5,
        fiber: 3,
      },
      "cup": {
        calories: 200,
        protein: 9.3,
        carbs: 26.7,
        fats: 6.7,
        fiber: 4,
      },
      "grams": {
        caloriesPerGram: 1.0,
        proteinPerGram: 0.047,
        carbsPerGram: 0.133,
        fatsPerGram: 0.033,
        fiberPerGram: 0.02,
      },
    },
  },
  "dal tadka": {
    name: "Dal Tadka",
    category: "Lentils",
    measurements: {
      "katori": {
        calories: 150,
        protein: 7,
        carbs: 20,
        fats: 5,
        fiber: 3,
      },
      "cup": {
        calories: 200,
        protein: 9.3,
        carbs: 26.7,
        fats: 6.7,
        fiber: 4,
      },
      "grams": {
        caloriesPerGram: 1.0,
        proteinPerGram: 0.047,
        carbsPerGram: 0.133,
        fatsPerGram: 0.033,
        fiberPerGram: 0.02,
      },
    },
  },
  "dosa": {
    name: "Plain Dosa",
    category: "South Indian",
    measurements: {
      "piece": {
        calories: 168,
        protein: 4.1,
        carbs: 33,
        fats: 2.6,
        fiber: 1.4,
      },
    },
  },
  "hot tea": {
    name: "Hot Tea",
    category: "Beverages",
    measurements: {
      "cup (240ml)": {
        calories: 39,
        protein: 0.9,
        carbs: 6.2,
        fats: 1.3,
        fiber: 0,
      },
      "ml": {
        caloriesPerMl: 0.161,
        proteinPerMl: 0.004,
        carbsPerMl: 0.026,
        fatsPerMl: 0.005,
        fiberPerMl: 0,
      },
    },
  },
  "idli": {
    name: "Idli",
    category: "South Indian",
    measurements: {
      "piece": {
        calories: 58,
        protein: 2.1,
        carbs: 12,
        fats: 0.2,
        fiber: 0.8,
      },
    },
  },
  "milk": {
    name: "Milk (Full Fat)",
    category: "Beverages",
    measurements: {
      "cup (240ml)": {
        calories: 149,
        protein: 8,
        carbs: 12,
        fats: 8,
        fiber: 0,
      },
      "glass (200ml)": {
        calories: 124,
        protein: 6.7,
        carbs: 10,
        fats: 6.7,
        fiber: 0,
      },
      "ml": {
        caloriesPerMl: 0.62,
        proteinPerMl: 0.033,
        carbsPerMl: 0.05,
        fatsPerMl: 0.033,
        fiberPerMl: 0,
      },
    },
  },
  "milk (full fat)": {
    name: "Milk (Full Fat)",
    category: "Beverages",
    measurements: {
      "cup (240ml)": {
        calories: 149,
        protein: 8,
        carbs: 12,
        fats: 8,
        fiber: 0,
      },
      "glass (200ml)": {
        calories: 124,
        protein: 6.7,
        carbs: 10,
        fats: 6.7,
        fiber: 0,
      },
      "ml": {
        caloriesPerMl: 0.62,
        proteinPerMl: 0.033,
        carbsPerMl: 0.05,
        fatsPerMl: 0.033,
        fiberPerMl: 0,
      },
    },
  },
  "plain dosa": {
    name: "Plain Dosa",
    category: "South Indian",
    measurements: {
      "piece": {
        calories: 168,
        protein: 4.1,
        carbs: 33,
        fats: 2.6,
        fiber: 1.4,
      },
    },
  },
  "rice": {
    name: "Steamed Rice",
    category: "Rice",
    measurements: {
      "katori": {
        calories: 205,
        protein: 4.2,
        carbs: 45,
        fats: 0.5,
        fiber: 0.6,
      },
      "cup": {
        calories: 273,
        protein: 5.6,
        carbs: 60,
        fats: 0.7,
        fiber: 0.8,
      },
      "grams": {
        caloriesPerGram: 1.37,
        proteinPerGram: 0.028,
        carbsPerGram: 0.3,
        fatsPerGram: 0.0035,
        fiberPerGram: 0.004,
      },
    },
  },
  "roti": {
    name: "Roti/Chapati",
    category: "Breads",
    measurements: {
      "piece": {
        calories: 102,
        protein: 3.6,
        carbs: 18,
        fats: 1.2,
        fiber: 2.5,
      },
    },
  },
  "roti/chapati": {
    name: "Roti/Chapati",
    category: "Breads",
    measurements: {
      "piece": {
        calories: 102,
        protein: 3.6,
        carbs: 18,
        fats: 1.2,
        fiber: 2.5,
      },
    },
  },
  "sabji": {
    name: "Aloo Sabji",
    category: "Vegetables",
    measurements: {
      "katori": {
        calories: 132,
        protein: 2.8,
        carbs: 18,
        fats: 6,
        fiber: 2.4,
      },
      "grams": {
        caloriesPerGram: 0.88,
        proteinPerGram: 0.019,
        carbsPerGram: 0.12,
        fatsPerGram: 0.04,
        fiberPerGram: 0.016,
      },
    },
  },
  "samosa": {
    name: "Samosa",
    category: "Snacks",
    measurements: {
      "piece": {
        calories: 252,
        protein: 4.8,
        carbs: 28,
        fats: 13.5,
        fiber: 2.2,
      },
    },
  },
  "steamed rice": {
    name: "Steamed Rice",
    category: "Rice",
    measurements: {
      "katori": {
        calories: 205,
        protein: 4.2,
        carbs: 45,
        fats: 0.5,
        fiber: 0.6,
      },
      "cup": {
        calories: 273,
        protein: 5.6,
        carbs: 60,
        fats: 0.7,
        fiber: 0.8,
      },
      "grams": {
        caloriesPerGram: 1.37,
        proteinPerGram: 0.028,
        carbsPerGram: 0.3,
        fatsPerGram: 0.0035,
        fiberPerGram: 0.004,
      },
    },
  },
  "tadka": {
    name: "Dal Tadka",
    category: "Lentils",
    measurements: {
      "katori": {
        calories: 150,
        protein: 7,
        carbs: 20,
        fats: 5,
        fiber: 3,
      },
      "cup": {
        calories: 200,
        protein: 9.3,
        carbs: 26.7,
        fats: 6.7,
        fiber: 4,
      },
      "grams": {
        caloriesPerGram: 1.0,
        proteinPerGram: 0.047,
        carbsPerGram: 0.133,
        fatsPerGram: 0.033,
        fiberPerGram: 0.02,
      },
    },
  },
  "tea": {
    name: "Hot Tea",
    category: "Beverages",
    measurements: {
      "cup (240ml)": {
        calories: 39,
        protein: 0.9,
        carbs: 6.2,
        fats: 1.3,
        fiber: 0,
      },
      "ml": {
        caloriesPerMl: 0.161,
        proteinPerMl: 0.004,
        carbsPerMl: 0.026,
        fatsPerMl: 0.005,
        fiberPerMl: 0,
      },
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userInput, clientDateTime } = req.body;
  console.log('Received from client:', { userInput, clientDateTime });

  if (!userInput || !clientDateTime) {
    return res.status(400).json({ error: 'User input and clientDateTime are required' });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Updated model
      generationConfig: {
        temperature: 0,
        topP: 0.1, // More focused responses
      }
    });

    // Create nutrition reference for the prompt
    const nutritionReference = Object.entries(NUTRITION_DB)
      .map(([food, data]) => `${food}: ${data.calories}cal, ${data.protein}g protein, ${data.carbs}g carbs, ${data.fats}g fat, ${data.fiber}g fiber`)
      .slice(0, 15) // Include top 15 in prompt
      .join('\n');

    const prompt = `
You are a nutrition assistant. Using the user's local time: ${clientDateTime}, parse their text to identify all foods and quantitys.

**IMPORTANT: For nutrition values, use ONLY these standardized values:**
${nutritionReference}

If food is not in the reference above, estimate but set confidence to 0.6 or lower.

User's text: "${userInput}"

Return ONLY a valid JSON array where each object has:
- "id": unique identifier (format: foodname_quantity_YYYYMMDD_HHMM)
- "food_name": string (standardized name)
- "calories": number (per serving, not per 100g)
- "quantity": number
- "measurement": string ("pieces","g","cup","ml")
- "dateTime": string
- "confidence": number (0.0–1.0, use 0.95+ for reference foods)
- "nutrition": { "protein": number, "carbs": number, "fats": number, "fiber": number }
- "notes": string or null
- "hydration_credit": number or null (for liquid foods)

Example output:
[
  {
    "id":"idli_2_20251015_2037",
    "food_name":"idli",
    "calories":58,
    "quantity":2,
    "measurement":"pieces",
    "dateTime":"${clientDateTime}",
    "confidence":0.95,
    "nutrition":{"protein":2.1,"carbs":12,"fats":0.2,"fiber":0.8},
    "notes":"Standard idli serving",
    "hydration_credit":null
  }
]
`;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();

    console.log('Raw response:', responseText);

    // Clean response
    let cleanedText = responseText
      .replace(/```/g, '')
      .replace(/json/g, '')
      .trim();

    console.log('Cleaned text:', cleanedText);

    const items = JSON.parse(cleanedText);

    // POST-PROCESS: Enforce consistent nutrition values
    items.forEach(item => {
      const foodKey = item.food_name.toLowerCase().trim();
      const nutritionData = NUTRITION_DB[foodKey];
      
      if (nutritionData) {
        // Override AI values with our consistent data
        item.calories = nutritionData.calories * item.quantity;
        item.nutrition = {
          protein: nutritionData.protein * item.quantity,
          carbs: nutritionData.carbs * item.quantity,
          fats: nutritionData.fats * item.quantity,
          fiber: nutritionData.fiber * item.quantity
        };
        item.confidence = 0.98; // High confidence for known foods
        console.log(`✅ Applied consistent nutrition for: ${foodKey}`);
      } else {
        console.log(`⚠️ Unknown food, using AI estimate: ${foodKey}`);
        item.confidence = Math.min(item.confidence || 0.6, 0.7);
      }

      // Handle hydration credit
      const liquidmeasurements = ['ml', 'cup'];
      if (liquidmeasurements.includes(item.measurement)) {
        const factor = item.measurement === 'cup' ? 240 : 1;
        item.hydration_credit = item.quantity * factor;
      } else {
        item.hydration_credit = null;
      }
    });

    return res.status(200).json(items);
  } catch (err) {
    console.error('Error in analyzeFoodIntake handler:', err);
    return res.status(500).json({ 
      error: 'Failed to analyze food intake with AI',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
