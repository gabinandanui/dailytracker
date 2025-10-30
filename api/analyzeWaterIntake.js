// api/analyzeWaterIntake.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get BOTH values from the request body
  const { userInput, clientDateTime } = req.body;

  // Add a log to see what the server is receiving
  console.log('Received from client:', { userInput, clientDateTime });

  if (!userInput || !clientDateTime) {
    return res.status(400).json({ error: 'User input and client time are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 2. USE the clientDateTime in the prompt instead of generating a new date
    const prompt = `
You are a health tracking assistant. Using the user's local time: ${clientDateTime}, analyze their text to determine exactly what beverage and how much they consumed.

User's text: "${userInput}"

Return ONLY a valid JSON object with these keys:
- "id": a unique identifier
- "food_name": one of: water, tea, coffee, juice, milk, soda, other
- "quantity": number (in ml)
- "measurement": "ml"
- "food_type": "wateritem"
- "dateTime": string (use "${clientDateTime}" if no specific time in text)
- "confidence": number (0.0–1.0) your certainty
- "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number
  }
- "hydration_value": number (ml adjusted by hydration factor)
- "food_info": {
    "name": string,
    "icon": string,
    "hydration_factor": number
  }
- "notes": string or null (any assumptions)
If the user's text refers to non‐liquid foods (e.g., "dosa", "idly", "sandwich"), throw an error by returning HTTP 400 with JSON:
{ "error": "Non‐liquid item detected: <item>" }
Follow these conversion guidelines:
- 1 cup = 240ml, 1 tea cup = 100ml
- 1 glass = 250ml
- 1 small bottle = 330ml, regular bottle = 500ml, large bottle = 750ml

Use per-100ml nutritional values from your database.  
Example response for “I drank a tea cup”:
\`\`\`json
{
  "food_name":"tea",
  food_type:'wateritem',
  "quantity":100,
  "measurement":"ml",
  "dateTime":"${clientDateTime}",
  "confidence":0.95,
  "nutrition":{"calories":16,"protein":0.4,"carbs":2.6,"fats":0.5,"fiber":0},
  "hydration_value":85,
  "food_info":{"name":"Tea","icon":"🍵","hydration_factor":0.85},
  "notes":"Assumed 1 tea cup = 100ml"
}
\`\`\`
`;


    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    // Clean and parse the response
    const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();
    const jsonData = JSON.parse(cleanedText);
     // If model returned "other" for food_name with non-zero quantity, treat as error
    const foods = ['dosa','idly','sandwich','pizza','burger','rice'];
    const lowerInput = userInput.toLowerCase();
    const foodDetected = foods.find(f => lowerInput.includes(f));

    if (foodDetected) {
      return res.status(400).json({ error: `Non-liquid item detected: ${foodDetected}` });
    }
    res.status(200).json(jsonData);
    
  } catch (err) {
    console.error('Error in handler:', err);
    return res.status(500).json({ error: 'Failed to analyze input with AI' });
  }
}