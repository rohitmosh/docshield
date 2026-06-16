"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const LifecycleService_1 = require("../services/LifecycleService");
const db_1 = require("../config/db");
const AuditRepository_1 = require("../repositories/AuditRepository");
const UserRepository_1 = require("../repositories/UserRepository");
class AdminController {
    static getExpired(req, res) {
        try {
            const files = LifecycleService_1.LifecycleService.getExpiredFiles();
            res.status(200).json(files);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static purge(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            LifecycleService_1.LifecycleService.purgeDocument(id, user, ip);
            res.status(200).json({ success: true, message: 'Document securely shredded.' });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static getWebhook(req, res) {
        try {
            const query = db_1.db.prepare('SELECT url, event FROM webhook_config WHERE id = ?');
            const row = query.get('default');
            res.status(200).json(row || { url: '', event: 'document.published' });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static saveWebhook(req, res) {
        try {
            const { url, event } = req.body;
            const stmt = db_1.db.prepare('INSERT OR REPLACE INTO webhook_config (id, url, event) VALUES (?, ?, ?)');
            stmt.run('default', url, event);
            res.status(200).json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static testWebhook(req, res) {
        try {
            const { url, event } = req.body;
            const user = req.user;
            const payload = {
                event,
                timestamp: new Date().toISOString(),
                triggeredBy: user.email || 'system',
                environment: 'OHPC_DocShield_Live',
                document: {
                    id: 'doc-sample-hook',
                    name: 'Mock_System_Tender_Notification.pdf',
                    classification: 'RESTRICTED',
                    checksum: 'SHA256:E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
                }
            };
            // Add to audit trail
            const auditLog = {
                id: 'aud-' + Math.random().toString(36).substring(2, 11),
                timestamp: new Date().toISOString(),
                user: user.email || user.name,
                role: user.role,
                action: 'Test Webhook Integration',
                resource: `Dispatched ${event} event`,
                status: 'Success',
                ip_address: req.ip || '127.0.0.1'
            };
            AuditRepository_1.AuditRepository.create(auditLog);
            res.status(200).json({ success: true, payload });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static updateUser(req, res) {
        try {
            const { id } = req.params;
            const { dept, rank, can_edit, can_view_history } = req.body;
            UserRepository_1.UserRepository.update(id, {
                dept,
                rank,
                can_edit: can_edit ? 1 : 0,
                can_view_history: can_view_history ? 1 : 0
            });
            res.status(200).json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static getTags(req, res) {
        try {
            const rows = db_1.db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
            res.status(200).json(rows);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static createTag(req, res) {
        try {
            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ error: 'Tag name is required' });
                return;
            }
            const stmt = db_1.db.prepare('INSERT INTO tags (name) VALUES (?)');
            stmt.run(name.trim().toLowerCase());
            res.status(201).json({ success: true, name: name.trim().toLowerCase() });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static getDepartments(req, res) {
        try {
            const rows = db_1.db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
            res.status(200).json(rows);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static createDepartment(req, res) {
        try {
            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ error: 'Department name is required' });
                return;
            }
            const stmt = db_1.db.prepare('INSERT INTO departments (name) VALUES (?)');
            stmt.run(name.trim());
            res.status(201).json({ success: true, name: name.trim() });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static updateDepartment(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const newName = name?.trim();
            if (!newName) {
                res.status(400).json({ error: 'Department name is required' });
                return;
            }
            // Get old name
            const getOldNameQuery = db_1.db.prepare('SELECT name FROM departments WHERE id = ?');
            const oldNameRow = getOldNameQuery.get(id);
            if (!oldNameRow) {
                res.status(404).json({ error: 'Department not found' });
                return;
            }
            const oldName = oldNameRow.name;
            if (oldName === newName) {
                res.status(200).json({ success: true });
                return;
            }
            // Update departments table
            const updateDeptStmt = db_1.db.prepare('UPDATE departments SET name = ? WHERE id = ?');
            updateDeptStmt.run(newName, id);
            // Cascade updates
            // 1. users
            const updateUserStmt = db_1.db.prepare('UPDATE users SET dept = ? WHERE dept = ?');
            updateUserStmt.run(newName, oldName);
            // 2. files department
            const updateFileDeptStmt = db_1.db.prepare('UPDATE files SET department = ? WHERE department = ?');
            updateFileDeptStmt.run(newName, oldName);
            // 3. folders allowed_depts
            const folders = db_1.db.prepare('SELECT id, allowed_depts FROM folders').all();
            const updateFolderDeptsStmt = db_1.db.prepare('UPDATE folders SET allowed_depts = ? WHERE id = ?');
            for (const f of folders) {
                const depts = JSON.parse(f.allowed_depts || '[]');
                if (depts.includes(oldName)) {
                    const updated = depts.map(d => d === oldName ? newName : d);
                    updateFolderDeptsStmt.run(JSON.stringify(updated), f.id);
                }
            }
            // 4. files allowed_depts
            const files = db_1.db.prepare('SELECT id, allowed_depts FROM files').all();
            const updateFileDeptsStmt = db_1.db.prepare('UPDATE files SET allowed_depts = ? WHERE id = ?');
            for (const fl of files) {
                const depts = JSON.parse(fl.allowed_depts || '[]');
                if (depts.includes(oldName)) {
                    const updated = depts.map(d => d === oldName ? newName : d);
                    updateFileDeptsStmt.run(JSON.stringify(updated), fl.id);
                }
            }
            res.status(200).json({ success: true, oldName, newName });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.AdminController = AdminController;
