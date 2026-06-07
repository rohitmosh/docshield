import { db } from '../config/db';
import { AuditLog } from '../models/AuditLog';

export class AuditRepository {
  static create(log: AuditLog): void {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user, role, action, resource, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      log.id,
      log.timestamp,
      log.user,
      log.role,
      log.action,
      log.resource,
      log.status,
      log.ip_address
    );
  }

  static findAll(actionFilter?: string): AuditLog[] {
    if (actionFilter && actionFilter !== 'ALL') {
      const query = db.prepare('SELECT * FROM audit_logs WHERE action = ? ORDER BY timestamp DESC');
      return query.all(actionFilter) as AuditLog[];
    } else {
      const query = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC');
      return query.all() as AuditLog[];
    }
  }
}
