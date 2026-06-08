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
            const { dept, rank, can_edit, can_approve } = req.body;
            UserRepository_1.UserRepository.update(id, {
                dept,
                rank,
                can_edit: can_edit ? 1 : 0,
                can_approve: can_approve ? 1 : 0
            });
            res.status(200).json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.AdminController = AdminController;
