const logger = require('../../utils/logger');
const config = require('../../config/env');

let connectionStatus = 'disconnected';

const getConnectionStatus = () => connectionStatus;

const handleConnectionUpdate = (update, makeWASocket, qrCallback) => {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    if (qrCallback) {
        qrCallback(qr);
    }
  }

  if (connection === 'close') {
    connectionStatus = 'disconnected';
    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401; // 401 means logged out
    logger.warn('WhatsApp connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
    
    if (shouldReconnect) {
      connectionStatus = 'connecting';
      setTimeout(() => {
        makeWASocket();
      }, config.whatsapp.reconnectInterval);
    }
  } else if (connection === 'open') {
    connectionStatus = 'connected';
    logger.info('WhatsApp connection opened successfully!');
  }
};

module.exports = {
  handleConnectionUpdate,
  getConnectionStatus
};
