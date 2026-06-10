"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRepository = void 0;
const db_1 = require("../config/db");
class FileRepository {
    static parseFile(row, versions = []) {
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            size: row.size,
            category: row.category,
            department: row.department,
            classification: row.classification,
            tags: JSON.parse(row.tags || '[]'),
            version: row.version,
            status: row.status,
            locked_by: row.locked_by,
            retention_years: row.retention_years,
            created_time: row.created_time,
            modified_time: row.modified_time,
            author: row.author,
            parent_id: row.parent_id,
            ocr_text: row.ocr_text,
            allowed_depts: JSON.parse(row.allowed_depts || '[]'),
            content: row.content,
            ciphertext: row.ciphertext || undefined,
            wrapped_key: row.wrapped_key || undefined,
            signature: row.signature || undefined,
            versions
        };
    }
    static findAll() {
        const query = db_1.db.prepare('SELECT * FROM files');
        const rows = query.all();
        return rows.map(r => {
            const versions = this.findVersionsByFileId(r.id);
            return this.parseFile(r, versions);
        });
    }
    static findById(id) {
        const query = db_1.db.prepare('SELECT * FROM files WHERE id = ?');
        const row = query.get(id);
        if (!row)
            return null;
        const versions = this.findVersionsByFileId(id);
        return this.parseFile(row, versions);
    }
    static findByParentId(parentId) {
        const query = db_1.db.prepare('SELECT * FROM files WHERE parent_id = ?');
        const rows = query.all(parentId);
        return rows.map(r => {
            const versions = this.findVersionsByFileId(r.id);
            return this.parseFile(r, versions);
        });
    }
    static create(file) {
        const stmt = db_1.db.prepare(`
      INSERT INTO files (
        id, name, type, size, category, department, classification, tags,
        version, status, locked_by, retention_years, created_time, modified_time,
        author, parent_id, ocr_text, allowed_depts, content, ciphertext, wrapped_key, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(file.id, file.name, file.type, file.size, file.category, file.department, file.classification, JSON.stringify(file.tags), file.version, file.status, file.locked_by, file.retention_years, file.created_time, file.modified_time, file.author, file.parent_id, file.ocr_text, JSON.stringify(file.allowed_depts), file.content, file.ciphertext || null, file.wrapped_key || null, file.signature || null);
        // Seed initial version
        if (file.versions && file.versions.length > 0) {
            this.addVersion(file.id, file.versions[0]);
        }
    }
    static updateMetadata(file) {
        const stmt = db_1.db.prepare(`
      UPDATE files 
      SET name = ?, classification = ?, category = ?, tags = ?, version = ?, 
          retention_years = ?, modified_time = ?, ciphertext = ?, wrapped_key = ?, signature = ?
      WHERE id = ?
    `);
        stmt.run(file.name, file.classification, file.category, JSON.stringify(file.tags), file.version, file.retention_years, file.modified_time, file.ciphertext || null, file.wrapped_key || null, file.signature || null, file.id);
    }
    static updateStatus(id, status) {
        const stmt = db_1.db.prepare('UPDATE files SET status = ? WHERE id = ?');
        stmt.run(status, id);
    }
    static updateLock(id, lockedBy) {
        const stmt = db_1.db.prepare('UPDATE files SET locked_by = ? WHERE id = ?');
        stmt.run(lockedBy, id);
    }
    static updateAllowedDepts(id, allowedDepts) {
        const stmt = db_1.db.prepare('UPDATE files SET allowed_depts = ? WHERE id = ?');
        stmt.run(JSON.stringify(allowedDepts), id);
    }
    static delete(id) {
        // Versions are deleted by ON DELETE CASCADE
        const stmt = db_1.db.prepare('DELETE FROM files WHERE id = ?');
        stmt.run(id);
    }
    // Version history operations
    static findVersionsByFileId(fileId) {
        const query = db_1.db.prepare('SELECT * FROM file_versions WHERE file_id = ? ORDER BY id DESC');
        const rows = query.all(fileId);
        return rows.map(r => ({
            version: r.version,
            author: r.author,
            timestamp: r.timestamp,
            change_reason: r.change_reason,
            name: r.name,
            type: r.type,
            size: r.size,
            category: r.category,
            classification: r.classification,
            tags: JSON.parse(r.tags || '[]'),
            department: r.department,
            content: r.content,
            ciphertext: r.ciphertext || undefined,
            wrapped_key: r.wrapped_key || undefined,
            signature: r.signature || undefined
        }));
    }
    static addVersion(fileId, ver) {
        const stmt = db_1.db.prepare(`
      INSERT INTO file_versions (
        file_id, version, author, timestamp, change_reason,
        name, type, size, category, classification, tags,
        department, content, ciphertext, wrapped_key, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(fileId, ver.version, ver.author, ver.timestamp, ver.change_reason, ver.name, ver.type, ver.size, ver.category, ver.classification, JSON.stringify(ver.tags), ver.department, ver.content, ver.ciphertext || null, ver.wrapped_key || null, ver.signature || null);
    }
    static findVersion(fileId, version) {
        const query = db_1.db.prepare('SELECT * FROM file_versions WHERE file_id = ? AND version = ?');
        const r = query.get(fileId, version);
        if (!r)
            return null;
        return {
            version: r.version,
            author: r.author,
            timestamp: r.timestamp,
            change_reason: r.change_reason,
            name: r.name,
            type: r.type,
            size: r.size,
            category: r.category,
            classification: r.classification,
            tags: JSON.parse(r.tags || '[]'),
            department: r.department,
            content: r.content,
            ciphertext: r.ciphertext || undefined,
            wrapped_key: r.wrapped_key || undefined,
            signature: r.signature || undefined
        };
    }
}
exports.FileRepository = FileRepository;
