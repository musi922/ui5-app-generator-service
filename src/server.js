import 'dotenv/config';
import fs from 'fs-extra';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const WORKSPACE = process.env.WORKSPACE_BASE_PATH || '/tmp/sap-projects';

await fs.ensureDir(WORKSPACE);
await fs.ensureDir('logs');

app.listen(PORT, () => {
  logger.info(`SAP Scaffold Agent running on port ${PORT}`);
  logger.info(`Workspace: ${WORKSPACE}`);
  logger.info(`Auth: ${process.env.AGENT_API_KEY ? 'enabled' : 'DISABLED (set AGENT_API_KEY)'}`);
});
