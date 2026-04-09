const OTPModel = require('../../database/models/otp');
const logger = require('../../utils/logger');
const config = require('../../config/env');
const { hashOTP } = require('../../otp/generator');

// Helper to extract phone without formatting
const extractPhone = (jid) => {
  return jid.split('@')[0];
};

// Delay implementation
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeReply = async (sock, jid, text) => {
  try {
    // Typing simulation based on baileys docs
    await sock.sendPresenceUpdate('composing', jid);
    
    // Random delay between 1-3 seconds
    const waitTime = 1000 + Math.random() * 2000;
    await delay(waitTime);

    // Send the message
    await sock.sendMessage(jid, { text });

    // Stop typing
    await sock.sendPresenceUpdate('paused', jid);
  } catch (error) {
    logger.error(error, `Failed to reply to ${jid}`);
  }
};

const sendWebhookCallback = async (url, payload, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.webhook.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    } else {
      logger.info(`Webhook successfully sent to ${url}`);
    }
  } catch (error) {
    logger.warn(`Webhook to ${url} failed on attempt ${attempt}: ${error.message}`);
    
    if (attempt < config.webhook.retryCount) {
      // Exponential backoff: baseDelay * (2 ^ (attempt - 1))
      const backoffDelay = config.webhook.retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying webhook to ${url} in ${backoffDelay}ms (Attempt ${attempt + 1}/${config.webhook.retryCount})`);
      
      await delay(backoffDelay);
      await sendWebhookCallback(url, payload, attempt + 1);
    } else {
      logger.error(`Webhook completely failed to ${url} after ${config.webhook.retryCount} attempts.`);
    }
  }
};

const handleIncomingMessage = async (sock, m) => {
  try {
    if (m.key.fromMe) return; // ignore our own messages
    
    const messageText = m.message?.conversation?.trim() || m.message?.extendedTextMessage?.text?.trim();
    if (!messageText) return; // ignore non-text messages
    
    const senderPhoneNumber = extractPhone(m.key.remoteJid);
    
    logger.debug(`Received message from ${senderPhoneNumber}: ${messageText}`);

    // Check if there's any active OTP pending for this phone number
    const pendingOTP = OTPModel.findActiveByPhone(senderPhoneNumber);

    if (pendingOTP) {
      // Hash the incoming text to compare with DB hashed code
      const hashedInput = hashOTP(messageText);

      if (pendingOTP.code === hashedInput) {
        // MATCH!
        OTPModel.markVerified(pendingOTP.id);
        
        logger.info(`OTP ${pendingOTP.id} verified for ${senderPhoneNumber}`);

        // Callback
        if (pendingOTP.callback_url) {
          const payload = {
            event: 'otp.verified',
            otp_id: pendingOTP.id,
            phone: senderPhoneNumber,
            metadata: pendingOTP.metadata,
            verified_at: new Date().toISOString()
          };
          
          // trigger webhook asynchronously
          sendWebhookCallback(pendingOTP.callback_url, payload).catch(err => {
             logger.error(err, 'Unhandled error in webhook callback chain');
          });
        } else {
            logger.info(`Mocking callback: webhook would be triggered for ${pendingOTP.id}`);
        }

        await safeReply(sock, m.key.remoteJid, "✅ Kode verifikasi berhasil! Silakan kembali ke aplikasi.");
      } else {
        // MISMATCH!
        OTPModel.incrementAttempts(pendingOTP.id);
        const currentAttempts = pendingOTP.attempts + 1;
        
        if (currentAttempts >= pendingOTP.max_attempts) {
           OTPModel.markFailed(pendingOTP.id);
           await safeReply(sock, m.key.remoteJid, "❌ Terlalu banyak percobaan gagal. Proses verifikasi dibatalkan.");
        } else {
           await safeReply(sock, m.key.remoteJid, `❌ Kode salah. Sisa percobaan: ${pendingOTP.max_attempts - currentAttempts}`);
        }
      }
    } else {
      // Unrecognized message
      if (config.whatsapp.replyOnUnknown) {
         // Instead of always replying, we could choose to ignore based on config, but if enabled:
         logger.debug(`No pending OTP for ${senderPhoneNumber}, replying with helper text.`);
         await safeReply(sock, m.key.remoteJid, "Hai! Saya adalah bot verifikasi OTP. Silakan kirim kode OTP yang diberikan oleh aplikasi Anda.");
      }
    }
  } catch (err) {
    logger.error(err, 'Error handling message');
  }
};

module.exports = {
  handleIncomingMessage,
  sendWebhookCallback // mainly exported for testing
};
