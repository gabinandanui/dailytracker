const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allows requests from your React frontend
app.use(express.json()); // Allows us to accept JSON data in the request body

// Define Routes
app.use('/api/data', require('./routes/dataRoutes'));
// AI/text analysis routes (simple fallback parser)
app.use('/api', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
  res.send('DailyTracker API running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));