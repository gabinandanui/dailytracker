// api/analyzeWaterTips.js - NEW FILE
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { intakeWaterHistoryData, targetWater, currentDateTime } = req.body;

  console.log('Received intake data for analysis:', { 
    historyCount: intakeWaterHistoryData?.length, 
    targetWater, 
    currentDateTime 
  });

  if (!intakeWaterHistoryData || !Array.isArray(intakeWaterHistoryData)) {
    return res.status(400).json({ error: 'Intake history data is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Calculate current stats
    const totalConsumed = intakeWaterHistoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const hydrationValue = intakeWaterHistoryData.reduce((sum, item) => sum + (item.hydration_value || item.quantity || 0), 0);
    const drinkTypes = intakeWaterHistoryData.map(item => item.food_name).join(', ');
    const timePattern = intakeWaterHistoryData.map(item => item.dateTime).join(', ');

    const prompt = `
You are a hydration and wellness expert. Analyze this user's water intake data and provide personalized tips.

Current Status:
- Target: ${targetWater || 2500}ml per day
- Consumed: ${totalConsumed}ml
- Effective Hydration: ${hydrationValue}ml
- Drinks: ${drinkTypes || 'None'}
- Times: ${timePattern || 'No intake recorded'}
- Current Time: ${currentDateTime}

Intake History (JSON):
${JSON.stringify(intakeWaterHistoryData, null, 2)}

Provide analysis and tips in this JSON format:
{
  "analysis": {
    "progress_percentage": number (0-100),
    "hydration_status": "excellent" | "good" | "needs_improvement" | "dehydrated",
    "daily_goal_likely": boolean,
    "drinking_pattern": "consistent" | "irregular" | "front_loaded" | "back_loaded" | "sparse"
  },
  "insights": [
    "Specific observation about their pattern...",
    "Another insight about timing/types..."
  ],
  "tips": [
    "Actionable tip #1",
    "Actionable tip #2", 
    "Actionable tip #3"
  ],
  "recommendations": {
    "next_intake_suggestion": "Drink 200ml water in the next hour",
    "ideal_next_time": "2024-10-12 12:30 PM",
    "suggested_drink": "water" | "tea" | "juice" etc,
    "motivation_message": "Encouraging message"
  },
  "health_benefits": [
    "Benefit you'll get from improving hydration",
    "Another health benefit"
  ]
}

Focus on:
- Realistic, actionable advice
- Positive reinforcement
- Timing optimization
- Drink variety balance
- Health benefits motivation
- Indian context (mention chai, etc. if relevant)
`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    // Clean and parse the response
    const cleanedText = responseText.replace(/``````/g, '').trim();
    const tipsData = JSON.parse(cleanedText);

    // Add metadata
    tipsData.generated_at = new Date().toISOString();
    tipsData.data_points = intakeWaterHistoryData.length;
    tipsData.total_analyzed = totalConsumed;

    res.status(200).json(tipsData);
    
  } catch (err) {
    console.error('Error analyzing water tips:', err);
    return res.status(500).json({ 
      error: 'Failed to generate tips', 
      fallback_tip: "Keep drinking water regularly throughout the day! Aim for 8-10 glasses."
    });
  }
}
