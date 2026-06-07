"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const FileRepository_1 = require("../repositories/FileRepository");
const FolderRepository_1 = require("../repositories/FolderRepository");
const AuditRepository_1 = require("../repositories/AuditRepository");
const cryptoUtils_1 = require("../utils/cryptoUtils");
// Mock Webhook Trigger
function triggerWebhook(event, details) {
    console.log(`[Webhook Service] Dispatched event "${event}" to listeners.`, details);
}
class DocumentService {
    static getVaultContent(folderId, userDept, userRole, userName) {
        // 1. Get child folders
        let folders = FolderRepository_1.FolderRepository.findByParentId(folderId);
        if (userRole !== 'SYSTEM_ADMIN') {
            folders = folders.filter(f => f.allowed_depts.includes(userDept));
        }
        // 2. Get child files
        let files = FileRepository_1.FileRepository.findByParentId(folderId);
        if (userRole !== 'SYSTEM_ADMIN') {
            files = files.filter(f => {
                if (f.classification === 'PUBLIC')
                    return true;
                if (f.author === userName)
                    return true;
                return f.allowed_depts.includes(userDept);
            });
        }
        return { folders, files };
    }
    static createFolder(name, parentId, allowedDepts, user, ip) {
        const id = 'f-' + Math.random().toString(36).substring(2, 11);
        const folder = {
            id,
            name,
            parent_id: parentId,
            allowed_depts: allowedDepts
        };
        FolderRepository_1.FolderRepository.create(folder);
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: 'Create Folder',
            resource: name,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        return folder;
    }
    static uploadDocument(name, size, category, department, classification, tags, retention, desc, parentId, user, ip) {
        const docId = 'doc-' + Math.random().toString(36).substring(2, 11);
        const fileType = name.split('.').pop()?.toUpperCase() || 'PDF';
        // 1. OCR text generation
        let ocrText = '';
        if (department === 'Generation') {
            ocrText = `OHPC Hydro Generating Station Operations. Balimela & Hirakud Power Plants, Unit overhaul specifications. Mechanical alignment logs, cooling water loop flow telemetry. Desc: ${desc || 'None'}`;
        }
        else if (department === 'Transmission') {
            ocrText = `Substation Grid Evacuation Map. Interlink blueprints for 220KV switchyard busbars. Relay protection parameters. Desc: ${desc || 'None'}`;
        }
        else if (department === 'Finance') {
            ocrText = `OHPC Corporate Accounts Ledger. Capital asset valuations, power purchase agreements (PPA) pricing structures. Desc: ${desc || 'None'}`;
        }
        else if (department === 'HR') {
            ocrText = `Human Resources Employee Charter. Staff alignment charts, reservoir safety awareness campaigns. Desc: ${desc || 'None'}`;
        }
        else if (department === 'IT') {
            ocrText = `DMS Server Telemetry & Cryptography Setup. Security access authorization matrices, REST API webhook integrations. Desc: ${desc || 'None'}`;
        }
        else {
            ocrText = `OHPC Corporate Record. Category: ${category}. Department: ${department}. Desc: ${desc || 'None'}`;
        }
        const content = desc || `OHPC system document ${name} payload. Classified as ${classification}.`;
        let ciphertext;
        let wrappedKey;
        let signature;
        // 2. Encryption if not public
        if (classification !== 'PUBLIC') {
            const cryptoEnvelope = (0, cryptoUtils_1.encryptDocument)(content, user.name);
            ciphertext = cryptoEnvelope.ciphertext;
            wrappedKey = cryptoEnvelope.wrappedKey;
            signature = cryptoEnvelope.signature;
        }
        const allDepts = ['Generation', 'Transmission', 'Finance', 'HR', 'IT', 'Legal'];
        const newDoc = {
            id: docId,
            name,
            type: fileType,
            size,
            category,
            department,
            classification,
            tags,
            version: 'v1.0',
            status: classification === 'PUBLIC' ? 'published' : 'pending',
            locked_by: null,
            retention_years: retention,
            created_time: Date.now(),
            modified_time: Date.now(),
            author: user.name,
            parent_id: parentId,
            ocr_text: ocrText,
            allowed_depts: allDepts,
            content,
            ciphertext,
            wrapped_key: wrappedKey,
            signature,
            versions: [
                {
                    version: 'v1.0',
                    author: user.name,
                    timestamp: this.formatDate(new Date()),
                    change_reason: 'Initial upload block initialization'
                }
            ]
        };
        FileRepository_1.FileRepository.create(newDoc);
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: 'Upload Document',
            resource: name,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        if (newDoc.status === 'published') {
            triggerWebhook('document.published', { name: newDoc.name, id: newDoc.id });
        }
        return newDoc;
    }
    static updateMetadata(id, name, classification, category, tags, retention, changeReason, user, ip) {
        const file = FileRepository_1.FileRepository.findById(id);
        if (!file)
            throw new Error('File not found');
        if (file.locked_by && file.locked_by !== user.name && user.role !== 'SYSTEM_ADMIN') {
            throw new Error('File is checked out by another editor');
        }
        // Increment version (v1.0 -> v2.0)
        const match = file.version.match(/v(\d+)\.(\d+)/);
        let nextVer = 'v2.0';
        if (match) {
            const major = parseInt(match[1], 10) + 1;
            nextVer = `v${major}.0`;
        }
        file.name = name;
        file.classification = classification;
        file.category = category;
        file.tags = tags;
        file.retention_years = retention;
        file.version = nextVer;
        file.modified_time = Date.now();
        // Re-encrypt if encryption is enabled and classification isn't public
        if (classification !== 'PUBLIC') {
            const cryptoEnvelope = (0, cryptoUtils_1.encryptDocument)(file.content, user.name);
            file.ciphertext = cryptoEnvelope.ciphertext;
            file.wrapped_key = cryptoEnvelope.wrappedKey;
            file.signature = cryptoEnvelope.signature;
        }
        else {
            file.ciphertext = undefined;
            file.wrapped_key = undefined;
            file.signature = undefined;
        }
        FileRepository_1.FileRepository.updateMetadata(file);
        const versionLog = {
            version: nextVer,
            author: user.name,
            timestamp: this.formatDate(new Date()),
            change_reason: changeReason || 'Metadata modifications applied'
        };
        FileRepository_1.FileRepository.addVersion(id, versionLog);
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: 'Save Revision',
            resource: `${file.name} updated to ${nextVer}`,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        return file;
    }
    static toggleLock(id, user, ip) {
        const file = FileRepository_1.FileRepository.findById(id);
        if (!file)
            throw new Error('File not found');
        let action = '';
        if (file.locked_by) {
            if (file.locked_by !== user.name && user.role !== 'SYSTEM_ADMIN') {
                throw new Error('You cannot unlock a document checked out by another editor');
            }
            file.locked_by = null;
            action = 'Unlock Document';
        }
        else {
            file.locked_by = user.name;
            action = 'Lock Document';
        }
        FileRepository_1.FileRepository.updateLock(id, file.locked_by);
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action,
            resource: file.name,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        return file;
    }
    static deleteDocument(id, user, ip) {
        const file = FileRepository_1.FileRepository.findById(id);
        if (!file)
            throw new Error('File not found');
        if (file.locked_by && file.locked_by !== user.name && user.role !== 'SYSTEM_ADMIN') {
            throw new Error('File is locked by another user');
        }
        FileRepository_1.FileRepository.delete(id);
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: 'Delete Document',
            resource: file.name,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
    }
    static approveDocument(id, approve, user, ip) {
        const file = FileRepository_1.FileRepository.findById(id);
        if (!file)
            throw new Error('File not found');
        const status = approve ? 'published' : 'draft';
        FileRepository_1.FileRepository.updateStatus(id, status);
        file.status = status;
        // Audit Log
        const log = {
            id: 'aud-' + Math.random().toString(36).substring(2, 11),
            timestamp: this.formatDate(new Date()),
            user: user.email || user.name,
            role: user.role,
            action: approve ? 'Approve Document' : 'Reject Document',
            resource: file.name,
            status: 'Success',
            ip_address: ip
        };
        AuditRepository_1.AuditRepository.create(log);
        if (approve) {
            triggerWebhook('document.published', { name: file.name, id: file.id });
        }
        return file;
    }
    // Utilities
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
exports.DocumentService = DocumentService;
