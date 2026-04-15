import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth.routes';
import profileRouter from './routes/profile.routes';
import visitRouter from './routes/visit.routes';
import medicationRouter from './routes/medication.routes';
import metricRouter from './routes/metric.routes';
import chatRouter from './routes/chat.routes';
import aiSettingsRouter from './routes/ai-settings.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { env } from './config/env';

const app = express();

app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/profile', requireAuth, profileRouter);
app.use('/api/visits', requireAuth, visitRouter);
app.use('/api/medications', requireAuth, medicationRouter);
app.use('/api/metrics', requireAuth, metricRouter);
app.use('/api/chat', requireAuth, chatRouter);
app.use('/api/ai-settings', requireAuth, aiSettingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
