require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  api: {
    masterKey: process.env.MASTER_API_KEY || 'dev-master-key-123',
    rateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW, 10) || 900000,
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 100
  },
  webhook: {
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT, 10) || 10000,
    retryCount: parseInt(process.env.WEBHOOK_RETRY_COUNT, 10) || 3,
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY, 10) || 5000
  },
  whatsapp: {
    authDir: process.env.WA_AUTH_DIR || './auth_state',
    replyOnUnknown: process.env.WA_REPLY_ON_UNKNOWN === 'true',
    reconnectInterval: parseInt(process.env.WA_RECONNECT_INTERVAL, 10) || 5000
  },
  otp: {
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    expirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS, 10) || 300,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3
  },
  database: {
    path: process.env.DB_PATH || './data/otp.db'
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
