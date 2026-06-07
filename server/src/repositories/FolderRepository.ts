import { db } from '../config/db';
import { Folder } from '../models/Folder';

export class FolderRepository {
  private static parseFolder(row: any): Folder {
    return {
      id: row.id,
      name: row.name,
      parent_id: row.parent_id,
      allowed_depts: JSON.parse(row.allowed_depts || '[]'),
      created_at: row.created_at
    };
  }

  static findAll(): Folder[] {
    const query = db.prepare('SELECT * FROM folders');
    const rows = query.all() as any[];
    return rows.map(r => this.parseFolder(r));
  }

  static findById(id: string): Folder | null {
    const query = db.prepare('SELECT * FROM folders WHERE id = ?');
    const row = query.get(id);
    return row ? this.parseFolder(row) : null;
  }

  static findByParentId(parentId: string): Folder[] {
    const query = db.prepare('SELECT * FROM folders WHERE parent_id = ?');
    const rows = query.all(parentId) as any[];
    return rows.map(r => this.parseFolder(r));
  }

  static create(folder: Folder): void {
    const stmt = db.prepare(`
      INSERT INTO folders (id, name, parent_id, allowed_depts)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      folder.id,
      folder.name,
      folder.parent_id,
      JSON.stringify(folder.allowed_depts)
    );
  }

  static updateAllowedDepts(id: string, allowedDepts: string[]): void {
    const stmt = db.prepare('UPDATE folders SET allowed_depts = ? WHERE id = ?');
    stmt.run(JSON.stringify(allowedDepts), id);
  }

  static delete(id: string): void {
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run(id);
  }
}
