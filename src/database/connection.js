const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const logger = require('../utils/logger');

// Ensure database directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
try {
  db = new Database(config.database.path, { verbose: (msg) => logger.debug(msg) });
  logger.info(`Connected to SQLite database at ${config.database.path}`);

  // Apply pragmas
  db.pragma('journal_mode = WAL');

  // Load and execute 001_init.sql if tables don't exist
  const initSqlPath = path.join(__dirname, 'migrations', '001_init.sql');
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    db.exec(initSql);
    logger.info('Database initialized and migrations applied');
  } else {
    logger.warn('Init migration script not found');
  }

} catch (err) {
  logger.error(err, 'Failed to connect to SQLite database');
  process.exit(1);
}

module.exports = db;
