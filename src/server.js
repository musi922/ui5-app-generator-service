import 'dotenv/config';
import fs from 'fs-extra';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
await fs.ensureDir('logs');
await fs.ensureDir('jobs');

app.listen(PORT, () => {
  logger.info(`SAP Scaffold Agent running on port ${PORT}`);
  logger.info(`Auth: ${process.env.AGENT_API_KEY ? 'enabled' : 'DISABLED (set AGENT_API_KEY)'}`);
});
