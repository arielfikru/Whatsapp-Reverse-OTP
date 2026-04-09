const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const OTPModel = require('../../database/models/otp');
const { generateOTPCode, generateOTPId, hashOTP } = require('../../otp/generator');
const config = require('../../config/env');

const router = express.Router();

const generateLimiter = rateLimit({
  windowMs: config.api.rateLimitWindow,
  max: config.api.rateLimitMax,
  validate: false, // turn off any validation
  keyGenerator: (req) => {
    // Avoid literal regex matches for the object prop
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const phoneSegment = req.body?.phone ? `_${req.body.phone}` : '';
    return clientIp + phoneSegment;
  },
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateSchema = z.object({
  phone: z.string().min(8).max(15),
  callback_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

router.post('/generate', generateLimiter, (req, res) => {
  try {
    const data = generateSchema.parse(req.body);
    
    // Check if there is an active OTP for this phone
    const existingOTP = OTPModel.findActiveByPhone(data.phone);
    if (existingOTP) {
      // Cancel previous active OTP to issue a new one
      OTPModel.cancelOtp(existingOTP.id);
    }

    const otpId = generateOTPId();
    const code = generateOTPCode();
    const hashedCode = hashOTP(code);
    
    // Calculate expiration
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + config.otp.expirySeconds);

    const otpRecord = {
      id: otpId,
      phone: data.phone,
      code: hashedCode, // Store hashed OTP in DB
      max_attempts: config.otp.maxAttempts,
      callback_url: data.callback_url || null,
      metadata: data.metadata || null,
      expires_at: expiryDate.toISOString()
    };

    OTPModel.create(otpRecord);

    return res.status(200).json({
      success: true,
      data: {
        otp_id: otpId,
        code: code, // Return plain OTP to client app
        phone: data.phone,
        whatsapp_number: config.whatsapp.phoneNumber,
        instruction: `Kirim kode ${code} ke nomor WhatsApp ${config.whatsapp.phoneNumber}`,
        expires_at: otpRecord.expires_at,
        expires_in_seconds: config.otp.expirySeconds
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/status/:id', (req, res) => {
  const otpId = req.params.id;
  const otp = OTPModel.findById(otpId);

  if (!otp) {
    return res.status(404).json({ success: false, error: 'OTP not found' });
  }

  return res.status(200).json({
    success: true,
    data: {
      otp_id: otp.id,
      phone: otp.phone,
      status: otp.status, // pending, verified, expired, failed
      created_at: otp.created_at,
      verified_at: otp.verified_at,
      expires_at: otp.expires_at
    }
  });
});

module.exports = router;
