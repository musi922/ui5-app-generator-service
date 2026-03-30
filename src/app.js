import express from 'express';
import scaffoldRouter from './routes/scaffold.js';
import { apiKeyAuth } from './utils/auth.js';
import logger from './utils/logger.js';

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/scaffold', apiKeyAuth, scaffoldRouter);

app.use((err, _req, res, _next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
