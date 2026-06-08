"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../config/db");
class UserRepository {
    static findById(id) {
        const query = db_1.db.prepare('SELECT * FROM users WHERE id = ?');
        const result = query.get(id);
        return result || null;
    }
    static findAll() {
        const query = db_1.db.prepare('SELECT * FROM users');
        return query.all();
    }
    static update(id, fields) {
        const keys = Object.keys(fields);
        if (keys.length === 0)
            return;
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        const query = db_1.db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
        query.run(...values, id);
    }
}
exports.UserRepository = UserRepository;
