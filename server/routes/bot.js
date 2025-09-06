// server/routes/bot.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    // Call Hugging Face API (GPT-2 model as example)
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    const reply =
      response.data && response.data[0] && response.data[0].generated_text
        ? response.data[0].generated_text
        : "Sorry, I could not generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error("Hugging Face Error:", err.response?.data || err.message);
    res.status(500).json({ msg: "Bot error" });
  }
});

module.exports = router;
