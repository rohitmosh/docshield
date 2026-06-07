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
}
exports.UserRepository = UserRepository;
