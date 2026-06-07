// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { env } from './env';

// Make sure target database dir exists or is resolved
const resolvedDbPath = path.isAbsolute(env.DB_PATH) 
  ? env.DB_PATH 
  : path.resolve(__dirname, '../../', env.DB_PATH);

console.log(`Connecting SQLite Database at: ${resolvedDbPath}`);

export const db = new DatabaseSync(resolvedDbPath);
