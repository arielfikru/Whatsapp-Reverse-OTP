const pino = require('pino');
const config = require('../config/env');

const logger = pino({
  level: config.logger.level,
  transport: config.server.nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  } : undefined
});

module.exports = logger;
