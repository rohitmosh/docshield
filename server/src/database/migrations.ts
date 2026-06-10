import { db } from '../config/db';

export function runMigrations() {
  console.log('Executing Database Schema Migrations...');

  // Drop tables for a clean refresh with new schemas
  db.exec('DROP TABLE IF EXISTS file_versions;');
  db.exec('DROP TABLE IF EXISTS files;');
  db.exec('DROP TABLE IF EXISTS folders;');
  db.exec('DROP TABLE IF EXISTS users;');
  db.exec('DROP TABLE IF EXISTS audit_logs;');
  db.exec('DROP TABLE IF EXISTS webhook_config;');
  db.exec('DROP TABLE IF EXISTS tags;');
  db.exec('DROP TABLE IF EXISTS departments;');

  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL,
      dept TEXT NOT NULL,
      avatar TEXT,
      rank TEXT,
      can_edit INTEGER DEFAULT 0,
      can_approve INTEGER DEFAULT 0,
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

  // 4. File Versions table (extended with metadata and content snapshot columns)
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id TEXT NOT NULL,
      version TEXT NOT NULL,
      author TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      change_reason TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      category TEXT NOT NULL,
      classification TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON string array
      department TEXT NOT NULL,
      content TEXT NOT NULL,
      ciphertext TEXT,
      wrapped_key TEXT,
      signature TEXT,
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

  // 7. Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // 8. Departments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  console.log('Migrations Completed Successfully.');
}

