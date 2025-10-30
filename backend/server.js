const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- START MODIFICATION ---
// Load the .env.local file from the project root (../.env.local)
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
// --- END MODIFICATION ---

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Start server only after MongoDB connection is established
// Use recommended options and fail fast on connection errors
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // This will now correctly find the MONGODB_URI
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Fail early if server selection takes too long
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    // Exit the process - this makes the failure visible and prevents buffered ops
    process.exit(1);
  }
}

startServer();

// Test route
app.get('/', (req, res) => {
  res.send('Health Tracker API is running');
});

// Define a schema for the userdailydata collection
const userDailyDataSchema = new mongoose.Schema({
    userId: String,
    date: Date,
});

// Create a model from the schema
const UserDailyData = mongoose.model('UserDailyData', userDailyDataSchema, 'userdailydata');

// Add a GET route to fetch all data from the userdailydata collection
app.get('/api/userdailydata', async (req, res) => {
  try {
    // Use maxTimeMS to set a query execution time limit (in ms).
    const data = await UserDailyData.find({}).maxTimeMS(20000).exec();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Note: server is started after DB connection in startServer()