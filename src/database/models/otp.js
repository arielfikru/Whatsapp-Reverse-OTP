const db = require('../connection');

const OTPModel = {
  create: (otp) => {
    const stmt = db.prepare(`
      INSERT INTO otps (id, phone, code, max_attempts, callback_url, metadata, expires_at)
      VALUES (@id, @phone, @code, @max_attempts, @callback_url, @metadata, @expires_at)
    `);
    
    return stmt.run({
      ...otp,
      metadata: otp.metadata ? JSON.stringify(otp.metadata) : null
    });
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM otps WHERE id = ?');
    const row = stmt.get(id);
    if (row && row.metadata) {
      try {
        row.metadata = JSON.parse(row.metadata);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return row;
  },

  findActiveByPhone: (phone) => {
    const stmt = db.prepare(`
      SELECT * FROM otps 
      WHERE phone = ? AND status = 'pending' AND datetime(expires_at) > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `);
    const row = stmt.get(phone);
    if (row && row.metadata) {
      try {
        row.metadata = JSON.parse(row.metadata);
      } catch (e) {}
    }
    return row;
  },

  markVerified: (id) => {
    const stmt = db.prepare(`
      UPDATE otps 
      SET status = 'verified', verified_at = datetime('now') 
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  incrementAttempts: (id) => {
    const stmt = db.prepare(`
      UPDATE otps 
      SET attempts = attempts + 1 
      WHERE id = ?
    `);
    return stmt.run(id);
  },

  markFailed: (id) => {
    const stmt = db.prepare(`
      UPDATE otps 
      SET status = 'failed' 
      WHERE id = ?
    `);
    return stmt.run(id);
  },
  
  cancelOtp: (id) => {
    const stmt = db.prepare(`
      UPDATE otps 
      SET status = 'failed' 
      WHERE id = ? AND status = 'pending'
    `);
    return stmt.run(id);
  }
};

module.exports = OTPModel;
