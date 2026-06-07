import dotenv from 'dotenv';
import path from 'path';

// Load environmental parameters
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_12345',
  DB_PATH: process.env.DB_PATH || './docshield.db',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
