// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const DailyLog = require('../models/dailyLogModel'); // Import the new model

/**
 * @route   POST /api/data/update
 * @desc    Create or update a LOG for a specific day
 * @access  Public
 * @body    { username: String, date: "YYYY-MM-DD", Fooddata: Array, waterdata: Array }
 */
router.post('/update', async (req, res) => {
  const { username, date, Fooddata, waterdata } = req.body;

  if (!username || !date) {
    return res.status(400).json({ msg: 'Username and date are required' });
  }

  // Convert string date (e.g., "2025-11-03") to a Date object at the
  // start of that day (in UTC) for consistent storage and querying.
  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

  try {
    const logData = await DailyLog.findOneAndUpdate(
      {
        username: username,
        date: queryDate         // Find the log for this user on this exact day
      },
      {
        $set: {                 // Update these fields
          Fooddata: Fooddata,
          waterdata: waterdata,
          username: username,   // Ensure these are set on creation
          date: queryDate
        }
      },
      {
        new: true,    // Return the new, updated document
        upsert: true  // If no doc found (upsert), create a new one
      }
    );

    res.json(logData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/data/get/:username/:date
 * @desc    Get a user's log for a specific date
 * @access  Public
 * @params  date format: YYYY-MM-DD (e.g., /api/data/get/gabinandan/2025-11-03)
 */
router.get('/get/:username/:date', async (req, res) => {
  try {
    const { username, date } = req.params;

    // Normalize date from parameters to match how it's stored
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    const log = await DailyLog.findOne({
      username: username,
      date: queryDate
    });

    if (!log) {
      // Not an error, just no data for this day.
      // Send back an empty structure for the frontend
      return res.json({
        username: username,
        date: queryDate,
        Fooddata: [],
        waterdata: []
      });
    }

    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/data/addFood
 * @desc    Add a single food item to today's log (atomic push)
 * @access  Public
 */
router.post('/addFood', async (req, res) => {
  const { username, date, foodItem } = req.body;

  if (!username || !date || !foodItem?.name || !foodItem?.calories) {
    return res.status(400).json({ msg: 'Username, date, and food item (with name and calories) are required' });
  }

  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  try {
    // First try to push to existing document
    let result = await DailyLog.findOneAndUpdate(
      { username, date: queryDate },
      { 
        $push: { Fooddata: foodItem }
      },
      { new: true }
    );

    // If no document exists yet, create one
    if (!result) {
      result = await DailyLog.create({
        username,
        date: queryDate,
        Fooddata: [foodItem],
        waterdata: []
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/data/addWater
 * @desc    Add a single water intake to today's log (atomic push)
 * @access  Public
 */
router.post('/addWater', async (req, res) => {
  const { username, date, waterItem } = req.body;

  if (!username || !date || !waterItem?.amount || !waterItem?.time) {
    return res.status(400).json({ msg: 'Username, date, and water item (with amount and time) are required' });
  }

  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  try {
    // First try to push to existing document
    let result = await DailyLog.findOneAndUpdate(
      { username, date: queryDate },
      { 
        $push: { waterdata: waterItem }
      },
      { new: true }
    );

    // If no document exists yet, create one
    if (!result) {
      result = await DailyLog.create({
        username,
        date: queryDate,
        Fooddata: [],
        waterdata: [waterItem]
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/data/deleteFood
 * @desc    Delete a single food item from today's log (pull by fields)
 * @access  Public
 */
router.post('/deleteFood', async (req, res) => {
  const { username, date, foodItem } = req.body;

  if (!username || !date || !foodItem?.name) {
    return res.status(400).json({ msg: 'Username, date, and foodItem.name are required' });
  }

  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  try {
    const result = await DailyLog.findOneAndUpdate(
      { username, date: queryDate },
      { $pull: { Fooddata: { name: foodItem.name, calories: foodItem.calories } } },
      { new: true }
    );

    return res.json(result || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/data/deleteWater
 * @desc    Delete a single water item from today's log (pull by fields)
 * @access  Public
 */
router.post('/deleteWater', async (req, res) => {
  const { username, date, waterItem } = req.body;

  if (!username || !date || waterItem?.amount == null) {
    return res.status(400).json({ msg: 'Username, date, and waterItem.amount are required' });
  }

  const queryDate = new Date(date);
  queryDate.setUTCHours(0, 0, 0, 0);

  try {
    // Build a flexible pull query that tolerates amount being string or number
    const pullQuery = {};
    if (waterItem?.time) pullQuery.time = waterItem.time;
    if (waterItem?.amount != null) {
      const num = Number(waterItem.amount);
      pullQuery.amount = { $in: [waterItem.amount, num] };
    }

    const result = await DailyLog.findOneAndUpdate(
      { username, date: queryDate },
      { $pull: { waterdata: pullQuery } },
      { new: true }
    );

    return res.json(result || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;