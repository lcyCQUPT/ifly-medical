import express from 'express';
import cors from 'cors';
import path from 'path';
import profileRouter from './routes/profile.routes';

const app = express();
const PORT = process.env.PORT ?? '3001';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/profile', profileRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(Number(PORT), () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
