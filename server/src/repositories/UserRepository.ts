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
}
