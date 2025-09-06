// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/", (req, res) => res.send("MediMateAI Server OK"));

// MongoDB connect
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

(async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
})();
