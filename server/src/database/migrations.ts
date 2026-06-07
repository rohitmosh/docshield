import { db } from '../config/db';

export function runMigrations() {
  console.log('Executing Database Schema Migrations...');

  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL,
      dept TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Folders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT NOT NULL,
      allowed_depts TEXT NOT NULL, -- JSON string array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      category TEXT NOT NULL,
      department TEXT NOT NULL,
      classification TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON string array
      version TEXT NOT NULL,
      status TEXT NOT NULL,
      locked_by TEXT,
      retention_years INTEGER NOT NULL,
      created_time INTEGER NOT NULL,
      modified_time INTEGER NOT NULL,
      author TEXT NOT NULL,
      parent_id TEXT NOT NULL,
      ocr_text TEXT NOT NULL,
      allowed_depts TEXT NOT NULL, -- JSON string array
      content TEXT NOT NULL,
      ciphertext TEXT,
      wrapped_key TEXT,
      signature TEXT
    );
  `);

  // 4. File Versions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id TEXT NOT NULL,
      version TEXT NOT NULL,
      author TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      change_reason TEXT NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files (id) ON DELETE CASCADE
    );
  `);

  // 5. Audit Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      status TEXT NOT NULL,
      ip_address TEXT NOT NULL
    );
  `);

  // 6. Webhooks Config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_config (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      event TEXT NOT NULL
    );
  `);

  console.log('Migrations Completed Successfully.');
}
