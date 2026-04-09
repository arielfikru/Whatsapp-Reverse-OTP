CREATE TABLE IF NOT EXISTS otps (
    id          TEXT PRIMARY KEY,           -- e.g. "otp_7f3a2b1c"
    phone       TEXT NOT NULL,             -- Nomor pengirim (user)
    code        TEXT NOT NULL,             -- Kode OTP (6 digit)
    status      TEXT NOT NULL DEFAULT 'pending',  -- pending | verified | expired | failed
    attempts    INTEGER NOT NULL DEFAULT 0,       -- Jumlah percobaan gagal
    max_attempts INTEGER NOT NULL DEFAULT 3,      -- Max percobaan
    callback_url TEXT,                     -- URL webhook setelah verified
    metadata    TEXT,                      -- JSON metadata dari client
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    verified_at TEXT,
    expires_at  TEXT NOT NULL,

    -- Indexes
    UNIQUE(phone, code, status)            -- Prevent duplicate active OTP
);

CREATE INDEX IF NOT EXISTS idx_otps_phone_status ON otps(phone, status);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_otps_status ON otps(status);

CREATE TABLE IF NOT EXISTS api_keys (
    id          TEXT PRIMARY KEY,
    key_hash    TEXT NOT NULL UNIQUE,       -- SHA-256 hash of API key
    name        TEXT NOT NULL,             -- Nama client / deskripsi
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
