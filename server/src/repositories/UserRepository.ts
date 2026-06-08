import { db } from '../config/db';
import { User } from '../models/User';

export class UserRepository {
  static findById(id: string): User | null {
    const query = db.prepare('SELECT * FROM users WHERE id = ?');
    const result = query.get(id) as User | undefined;
    return result || null;
  }

  static findAll(): User[] {
    const query = db.prepare('SELECT * FROM users');
    return query.all() as User[];
  }

  static update(id: string, fields: Partial<User>): void {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k as keyof typeof fields]);

    const query = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    query.run(...values, id);
  }
}

