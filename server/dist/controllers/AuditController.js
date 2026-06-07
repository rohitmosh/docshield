"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const AuditRepository_1 = require("../repositories/AuditRepository");
class AuditController {
    static getLogs(req, res) {
        try {
            const action = req.query.action;
            const logs = AuditRepository_1.AuditRepository.findAll(action);
            res.status(200).json(logs);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static exportCSV(req, res) {
        try {
            const logs = AuditRepository_1.AuditRepository.findAll();
            let csv = 'Timestamp,User,Security Role,Action,Resource Context,Status,IP Address\r\n';
            logs.forEach(log => {
                csv += `"${log.timestamp}","${log.user}","${log.role}","${log.action}","${log.resource}","${log.status}","${log.ip_address}"\r\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="DocShield_Audit_Ledger_${new Date().toISOString().substring(0, 10)}.csv"`);
            res.status(200).send(csv);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.AuditController = AuditController;
