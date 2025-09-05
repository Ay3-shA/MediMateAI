// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI set — skipping DB connection for now.');
}

// API routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.send('MediMateAI Server OK'));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
