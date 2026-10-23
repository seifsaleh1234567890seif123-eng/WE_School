const path = require('path');
const fs = require('fs');

let DatabaseSync = null;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (err) {
  console.warn('⚠️ node:sqlite is not available on this Node runtime. Please ensure Node.js >= 22.5 is used.');
}

let db = null;
const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (DatabaseSync) {
  try {
    let dbPath;
    if (isVercel) {
      // In Vercel serverless environment, only /tmp is writable
      dbPath = path.join('/tmp', 'we_schools.db');
    } else {
      const dataDir = path.join(__dirname, '..', '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      dbPath = path.join(dataDir, 'we_schools.db');
    }

    db = new DatabaseSync(dbPath);

    // Safe PRAGMA configurations
    try {
      if (isVercel) {
        db.exec('PRAGMA journal_mode = MEMORY;');
      } else {
        db.exec('PRAGMA journal_mode = WAL;');
      }
      db.exec('PRAGMA foreign_keys = ON;');
      db.exec('PRAGMA busy_timeout = 5000;');
      db.exec('PRAGMA synchronous = NORMAL;');
    } catch (pragmaErr) {
      console.warn('PRAGMA configuration warning:', pragmaErr.message);
    }
  } catch (initErr) {
    console.error('Failed to initialize SQLite DatabaseSync:', initErr.message);
    db = null;
  }
}

// Resilient Fallback Mock: If DatabaseSync failed or is absent, prevent 500 fatal server crashes
if (!db) {
  console.warn('⚠️ Using in-memory fallback mock for database calls');
  db = {
    isMock: true,
    exec: () => {},
    prepare: () => ({
      get: () => null,
      all: () => [],
      run: () => ({ lastInsertRowid: 1, changes: 0 })
    })
  };
}

module.exports = db;
