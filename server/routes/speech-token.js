// server/routes/speech-token.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * GET /api/speech-token
 * Returns Azure Speech token + region, or a flag indicating fallback to browser TTS.
 */
router.get('/', async (req, res) => {
  const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = process.env;
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    return res.json({ fallback: true });
  }
  const url = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  try {
    const tokenResponse = await axios.post(url, null, {
      headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY },
    });
    const token = tokenResponse.data;
    return res.json({ token, region: AZURE_SPEECH_REGION, fallback: false });
  } catch (err) {
    console.error('Azure Speech token error:', err);
    return res.json({ fallback: true });
  }
});

export default router;
