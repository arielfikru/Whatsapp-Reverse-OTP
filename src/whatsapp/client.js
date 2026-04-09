const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino'); // Baileys prefers pino internally as well
const config = require('../config/env');
const logger = require('../utils/logger');
const { handleConnectionUpdate } = require('./handlers/connection');
const { handleIncomingMessage } = require('./handlers/message');

let sock;

const setupClient = async (qrCallback) => {
  const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.authDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

  const startSock = () => {
    sock = makeWASocket({
      version,
      auth: state,
      // Use silent internal baileys logger
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // We will output QR using qrcode-terminal internally if needed, or pass via QR callback
      browser: Browsers.macOS('Desktop'), // Explicitly state browser to prevent 405 Connection Failure
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      handleConnectionUpdate(update, startSock, qrCallback);
    });

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          await handleIncomingMessage(sock, msg);
        }
      }
    });
  };

  startSock();
  return { getSock: () => sock };
};

module.exports = { setupClient };
