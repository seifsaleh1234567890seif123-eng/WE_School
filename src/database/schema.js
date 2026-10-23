const db = require('../config/db');

function initSchema() {
  db.exec(`
    -- 1. Admin Users
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 2. Specializations
    CREATE TABLE IF NOT EXISTS specializations (
      id TEXT PRIMARY KEY,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      short_desc_ar TEXT,
      short_desc_en TEXT,
      careers_ar TEXT,
      careers_en TEXT,
      certs TEXT,
      icon_url TEXT
    );

    -- 3. Schools (27 Governorates)
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      governorate_ar TEXT NOT NULL,
      governorate_en TEXT NOT NULL,
      city_ar TEXT,
      city_en TEXT,
      address_ar TEXT NOT NULL,
      address_en TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      min_score INTEGER DEFAULT 225,
      accepts_gender TEXT DEFAULT 'بنين وبنات',
      specializations TEXT,
      lat REAL,
      lng REAL,
      image_url TEXT,
      is_active INTEGER DEFAULT 1
    );

    -- 4. Student Applications
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      national_id TEXT UNIQUE NOT NULL,
      gender TEXT NOT NULL,
      prep_score REAL NOT NULL,
      governorate TEXT NOT NULL,
      student_phone TEXT NOT NULL,
      guardian_name TEXT NOT NULL,
      guardian_phone TEXT NOT NULL,
      email TEXT,
      email_verified INTEGER DEFAULT 0,
      primary_school_id TEXT NOT NULL REFERENCES schools(id),
      preferred_spec_id TEXT REFERENCES specializations(id),
      status TEXT DEFAULT 'submitted',
      interview_date TEXT,
      interview_location TEXT,
      admin_notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 4.1 OTP Verification Codes
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 5. Eligibility Checks Log
    CREATE TABLE IF NOT EXISTS eligibility_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prep_score REAL NOT NULL,
      governorate TEXT NOT NULL,
      age INTEGER NOT NULL,
      is_eligible INTEGER NOT NULL,
      reasons TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 6. Quiz Submissions
    CREATE TABLE IF NOT EXISTS quiz_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      recommended_spec TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 7. News & Announcements
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      desc_ar TEXT NOT NULL,
      desc_en TEXT NOT NULL,
      category TEXT NOT NULL,
      date_text TEXT NOT NULL,
      image_url TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 8. FAQs
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT DEFAULT 'general',
      question_ar TEXT NOT NULL,
      question_en TEXT NOT NULL,
      answer_ar TEXT NOT NULL,
      answer_en TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- 9. Contact Inquiries
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 10. Newsletter Subscribers
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 11. System Configuration & SMTP Settings
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- Indexes for fast queries
    CREATE INDEX IF NOT EXISTS idx_apps_code ON applications(app_code);
    CREATE INDEX IF NOT EXISTS idx_apps_nid ON applications(national_id);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_schools_gov_ar ON schools(governorate_ar);
    CREATE INDEX IF NOT EXISTS idx_schools_gov_en ON schools(governorate_en);
    CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured);
    CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email);
  `);

  // Auto-migration for existing DBs
  try { db.exec('ALTER TABLE applications ADD COLUMN email TEXT;'); } catch(e){}
  try { db.exec('ALTER TABLE applications ADD COLUMN email_verified INTEGER DEFAULT 0;'); } catch(e){}
}

module.exports = { initSchema };
