const apiServer = require('./api/server');
const { setupClient } = require('./whatsapp/client');
const config = require('./config/env');
const logger = require('./utils/logger');
const qrcode = require('qrcode-terminal');
const db = require('./database/connection');

let server;
let waClientManager;

const bootstrap = async () => {
  try {
    // Start Express API Server
    const port = config.server.port;
    const host = config.server.host;
    
    server = apiServer.listen(port, host, () => {
      logger.info(`Express API Server running at http://${host}:${port}`);
    });

    // Start WhatsApp Client
    logger.info('Initializing WhatsApp bot...');
    const qrCallback = (qr) => {
      logger.info('Please scan the QR code below to authenticate WhatsApp:');
      qrcode.generate(qr, { small: true });
    };

    waClientManager = await setupClient(qrCallback);

  } catch (error) {
    logger.error(error, 'Failed to bootstrap application');
    process.exit(1);
  }
};

bootstrap();

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  if (server) {
    logger.info('Closing Express Server...');
    server.close();
  }

  if (waClientManager) {
    const sock = waClientManager.getSock();
    if (sock && sock.ws) {
      logger.info('Closing WhatsApp connection...');
      sock.ws.close();
    }
  }

  logger.info('Closing SQLite Database...');
  db.close();
  
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
