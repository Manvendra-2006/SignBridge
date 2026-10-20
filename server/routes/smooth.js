// server/routes/smooth.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * POST /api/smooth
 * Body: { gloss: string[] }
 * Returns: { sentence: string, fallback?: boolean }
 */
router.post('/', async (req, res) => {
  const { gloss } = req.body;
  if (!Array.isArray(gloss) || gloss.some((g) => typeof g !== 'string')) {
    return res.status(400).json({ error: 'Invalid gloss payload' });
  }
  const joinedGloss = gloss.join(' ');

  const {
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_KEY,
    AZURE_OPENAI_DEPLOYMENT,
  } = process.env;

  // If any Azure variable missing, fallback immediately.
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
    return res.json({ sentence: joinedGloss, fallback: true });
  }

  const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;
  const payload = {
    messages: [
      { role: 'system', content: 'Convert sign-language gloss into one natural English sentence. Do not add new information. Output only the sentence.' },
      { role: 'user', content: joinedGloss },
    ],
    temperature: 0.2,
    max_tokens: 200,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY,
      },
    });
    const sentence = response.data?.choices?.[0]?.message?.content?.trim();
    if (sentence) {
      return res.json({ sentence });
    }
    // Unexpected shape – fall back.
    return res.json({ sentence: joinedGloss, fallback: true });
  } catch (err) {
    console.error('Azure OpenAI error:', err);
    return res.json({ sentence: joinedGloss, fallback: true });
  }
});

export default router;
