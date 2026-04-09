const config = require('../../config/env');

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API key is missing' });
  }

  // Phase 1 MVP: Master Key bypass validation
  if (apiKey === config.api.masterKey) {
    return next();
  }

  // For future implementation: Check DB for API keys mapped to hash
  return res.status(401).json({ success: false, error: 'Invalid API key' });
};

module.exports = authenticateApiKey;
