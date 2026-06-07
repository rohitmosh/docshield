"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleService = void 0;
const FileRepository_1 = require("../repositories/FileRepository");
const AuditRepository_1 = require("../repositories/AuditRepository");
const cryptoUtils_1 = require("../utils/cryptoUtils");
class LifecycleService {
    static getExpiredFiles() {
        const files = FileRepository_1.FileRepository.findAll();
        const now = Date.now();
        return files.filter(doc => {
            if (doc.retention_years === 99)
                return false; // Permanent archive
            const retentionMs = doc.retention_years * 365.25 * 24 * 60 * 60 * 1000;
            return (doc.created_time + retentionMs) < now;
        });
    }
    static purgeDocument(id, user, ip) {
        const file = FileRepository_1.FileRepository.findById(id);
        if (!file)
            throw new Error('File not found');
        const hash = (0, cryptoUtils_1.sha256)(file.name + file.size);
        // Hard delete file from databases
        FileRepository_1.FileRepository.delete(id);
        // Audit Log: Immutable Certificate of Destruction
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: 'Secure Purge (Certificate of Destruction)',
            resource: `${file.name} (SHA256:${hash} Shredded)`,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        console.log(`[Lifecycle Service] Secure purge executed. File ${file.name} shredded.`);
    }
    static formatDate(now) {
        const day = String(now.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hrs}:${mins}:${secs}`;
    }
}
exports.LifecycleService = LifecycleService;
