import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { visionRouter } from './routes/visionRoutes';

const app = express();

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(s => s.trim()) : true,
    credentials: true,
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/vision', visionRouter);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Vision backend listening on :${env.PORT}`);
});

