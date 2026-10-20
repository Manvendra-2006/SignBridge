
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import smoothRouter from './routes/smooth.js';
import speechTokenRouter from './routes/speech-token.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per IP per minute
  })
);

app.use('/api/smooth', smoothRouter);
app.use('/api/speech-token', speechTokenRouter);

app.get('/', (req, res) => {
  res.send('SignBridge backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
