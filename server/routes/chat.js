// server/routes/chat.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') return res.status(400).json({ msg: 'Message is required' });

    const HF_KEY = process.env.HF_API_KEY;
    if (!HF_KEY) {
      return res.status(500).json({ msg: 'AI service not configured' });
    }

    // build a little instruction so model acts like a medical assistant
    const prompt = `You are a helpful medical assistant. Patient asks: "${message}"\nAnswer concisely and politely.`;

    // Try text-generation model (gpt2 or an instruction model). Response formats vary so handle multiple shapes.
    const hfUrl = 'https://api-inference.huggingface.co/models/gpt2'; // change model if you prefer
    const hfResp = await axios.post(hfUrl, { inputs: prompt }, {
      headers: { Authorization: `Bearer ${HF_KEY}` },
      timeout: 120000
    });

    let botReply = '';

    // hfResp.data can be an object or array depending on model
    const data = hfResp.data;
    if (!data) botReply = 'Sorry, no response from AI.';
    else if (typeof data === 'string') botReply = data;
    else if (Array.isArray(data) && data[0]) {
      botReply = data[0].generated_text || data[0].text || JSON.stringify(data[0]);
    } else if (data.generated_text) {
      botReply = data.generated_text;
    } else {
      botReply = JSON.stringify(data).slice(0, 1000);
    }

    return res.json({ reply: botReply });
  } catch (err) {
    console.error('Chat/HF error:', err.response?.data || err.message || err);
    return res.status(500).json({ reply: '⚠️ AI service error. Try again later.' });
  }
});

module.exports = router;
