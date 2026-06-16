"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderRepository = void 0;
const db_1 = require("../config/db");
class FolderRepository {
    static parseFolder(row) {
        return {
            id: row.id,
            name: row.name,
            parent_id: row.parent_id,
            allowed_depts: JSON.parse(row.allowed_depts || '[]'),
            allowed_users: JSON.parse(row.allowed_users || '[]'),
            created_at: row.created_at
        };
    }
    static findAll() {
        const query = db_1.db.prepare('SELECT * FROM folders');
        const rows = query.all();
        return rows.map(r => this.parseFolder(r));
    }
    static findById(id) {
        const query = db_1.db.prepare('SELECT * FROM folders WHERE id = ?');
        const row = query.get(id);
        return row ? this.parseFolder(row) : null;
    }
    static findByParentId(parentId) {
        const query = db_1.db.prepare('SELECT * FROM folders WHERE parent_id = ?');
        const rows = query.all(parentId);
        return rows.map(r => this.parseFolder(r));
    }
    static create(folder) {
        const stmt = db_1.db.prepare(`
      INSERT INTO folders (id, name, parent_id, allowed_depts, allowed_users)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(folder.id, folder.name, folder.parent_id, JSON.stringify(folder.allowed_depts), JSON.stringify(folder.allowed_users || []));
    }
    static updateAllowedDepts(id, allowedDepts) {
        const stmt = db_1.db.prepare('UPDATE folders SET allowed_depts = ? WHERE id = ?');
        stmt.run(JSON.stringify(allowedDepts), id);
    }
    static updatePermissions(id, allowedDepts, allowedUsers) {
        const stmt = db_1.db.prepare('UPDATE folders SET allowed_depts = ?, allowed_users = ? WHERE id = ?');
        stmt.run(JSON.stringify(allowedDepts), JSON.stringify(allowedUsers), id);
    }
    static delete(id) {
        const stmt = db_1.db.prepare('DELETE FROM folders WHERE id = ?');
        stmt.run(id);
    }
}
exports.FolderRepository = FolderRepository;
