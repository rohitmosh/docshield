"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const db_1 = require("../config/db");
class AuditRepository {
    static create(log) {
        const stmt = db_1.db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user, role, action, resource, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(log.id, log.timestamp, log.user, log.role, log.action, log.resource, log.status, log.ip_address);
    }
    static findAll(actionFilter) {
        if (actionFilter && actionFilter !== 'ALL') {
            const query = db_1.db.prepare('SELECT * FROM audit_logs WHERE action = ? ORDER BY timestamp DESC');
            return query.all(actionFilter);
        }
        else {
            const query = db_1.db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC');
            return query.all();
        }
    }
}
exports.AuditRepository = AuditRepository;
