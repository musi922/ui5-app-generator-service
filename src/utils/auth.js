import logger from '../utils/logger.js';

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.AGENT_API_KEY;

  if (!expectedKey) {
    logger.warn('AGENT_API_KEY not set — running without authentication');
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    logger.warn(`Unauthorised request from ${req.ip} — invalid or missing API key`);
    return res.status(401).json({ error: 'Unauthorised' });
  }

  next();
}

export { apiKeyAuth };
