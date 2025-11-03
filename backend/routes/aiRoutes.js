const express = require('express');
const router = express.Router();

// A small, deterministic parser for common volume phrases.
// This avoids relying on external AI and prevents 500 errors in dev.
function parseVolume(text) {
  if (!text || typeof text !== 'string') return null;
  const t = text.toLowerCase();

  // common conversions
  const conversions = [
    { re: /tea\s*cup|teacup/, ml: 100 },
    { re: /cup/, ml: 240 },
    { re: /glass/, ml: 250 },
    { re: /small\s*bottle/, ml: 330 },
    { re: /regular\s*bottle|bottle/, ml: 500 },
    { re: /large\s*bottle/, ml: 750 },
    { re: /ml/, ml: 1 },
    { re: /l\b/, ml: 1000 }
  ];

  // match explicit numbers with units: "750ml", "250 ml", "1.5L", "2 cups"
  const explicit = t.match(/([0-9]+(?:\.[0-9]+)?)\s*(ml|l|litre|liter|cups|cup|tea cup|teacup|glass|bottle)/);
  if (explicit) {
    let num = parseFloat(explicit[1]);
    const unit = explicit[2];
    if (/ml/.test(unit)) return Math.round(num);
    if (/l|litre|liter/.test(unit)) return Math.round(num * 1000);
    if (/cup|cups/.test(unit)) return Math.round(num * 240);
    if (/tea\s*cup|teacup/.test(unit)) return Math.round(num * 100);
    if (/glass/.test(unit)) return Math.round(num * 250);
    if (/bottle/.test(unit)) return Math.round(num * 500);
  }

  // match verbal phrases e.g., "a tea cup", "one cup"
  const verbal = t.match(/(one|a|an|[0-9]+)\s*(tea cup|teacup|cup|glass|small bottle|large bottle|bottle)/);
  if (verbal) {
    const count = verbal[1] === 'one' || verbal[1] === 'a' || verbal[1] === 'an' ? 1 : parseInt(verbal[1], 10);
    const unit = verbal[2];
    const conv = conversions.find(c => c.re.test(unit));
    if (conv) return count * conv.ml;
  }

  // fallback: look for a bare number and assume ml if reasonably sized
  const bare = t.match(/([0-9]{2,4})/);
  if (bare) {
    const v = parseInt(bare[1], 10);
    if (v > 0 && v <= 2000) return v; // accept up to 2L
  }

  return null;
}

router.post('/analyzeWaterIntake', async (req, res) => {
  try {
    const { userInput, clientDateTime } = req.body || {};
    if (!userInput) return res.status(400).json({ error: 'userInput required' });

    const quantity = parseVolume(userInput);
    if (!quantity) return res.status(400).json({ error: 'Could not parse volume from input' });

    const dateTime = clientDateTime || new Date().toLocaleString();

    const result = {
      id: String(Date.now()),
      food_name: /tea|coffee|juice|soda|milk/.test(userInput.toLowerCase()) ? (userInput.match(/tea|coffee|juice|soda|milk/)[0]) : 'water',
      quantity: quantity,
      measurement: 'ml',
      food_type: 'wateritem',
      dateTime,
      confidence: 0.8,
      nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      hydration_value: quantity,
      food_info: { name: 'Water', icon: '💧', hydration_factor: 1 },
      notes: null
    };

    return res.json(result);
  } catch (err) {
    console.error('AI fallback error:', err);
    return res.status(500).json({ error: 'Failed to analyze input' });
  }
});

module.exports = router;
