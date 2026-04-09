const crypto = require('crypto');
const config = require('../config/env');

const generateOTPCode = (length = config.otp.length) => {
  // Generate random numeric code
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
};

const generateOTPId = () => {
  return `otp_${crypto.randomBytes(4).toString('hex')}`;
};

const hashOTP = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

module.exports = {
  generateOTPCode,
  generateOTPId,
  hashOTP
};
