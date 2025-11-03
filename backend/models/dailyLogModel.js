// models/dailyLogModel.js
const mongoose = require('mongoose');

// Sub-schema for a single food item
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
});

// Sub-schema for a single water entry
const waterSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  time: { type: String, required: true }
});

// This is the main schema: one document per user per day
const dailyLogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true // We will query by this
  },
  date: {
    type: Date,
    required: true,
    index: true // We will also query by this
  },
  Fooddata: [foodSchema],  // An array of food items for THIS day
  waterdata: [waterSchema] // An array of water items for THIS day
}, {
  timestamps: true
});

// CRITICAL FOR PERFORMANCE:
// Creates a unique compound index on username and date.
// 1. Ensures a user can only have ONE document per date.
// 2. Makes finding that document extremely fast.
dailyLogSchema.index({ username: 1, date: 1 }, { unique: true });

// This will create/use a collection named 'dailylogs'
module.exports = mongoose.model('DailyLog', dailyLogSchema);