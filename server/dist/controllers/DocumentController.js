"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const DocumentService_1 = require("../services/DocumentService");
const CryptoService_1 = require("../services/CryptoService");
const FileRepository_1 = require("../repositories/FileRepository");
const FolderRepository_1 = require("../repositories/FolderRepository");
class DocumentController {
    static getVault(req, res) {
        try {
            const folderId = req.query.folderId || 'root';
            const all = req.query.all === 'true';
            const user = req.user;
            if (all) {
                let files = FileRepository_1.FileRepository.findAll();
                if (user.role !== 'SYSTEM_ADMIN') {
                    files = files.filter(f => f.classification === 'PUBLIC' || f.author === user.name || f.allowed_depts.includes(user.dept));
                }
                res.status(200).json({ files });
            }
            else {
                const content = DocumentService_1.DocumentService.getVaultContent(folderId, user.dept, user.role, user.name);
                res.status(200).json(content);
            }
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static createFolder(req, res) {
        try {
            const { name, parentId, allowedDepts } = req.body;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            if (!name || !parentId) {
                res.status(400).json({ error: 'Folder name and parent ID are required' });
                return;
            }
            const folder = DocumentService_1.DocumentService.createFolder(name, parentId, allowedDepts || ['Generation', 'Transmission', 'Finance', 'HR', 'IT', 'Legal'], user, ip);
            res.status(201).json(folder);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static uploadFile(req, res) {
        try {
            const { name, size, category, department, classification, tags, retention, desc, parentId, author } = req.body;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            if (!name || !parentId) {
                res.status(400).json({ error: 'File name and parent ID are required' });
                return;
            }
            const file = DocumentService_1.DocumentService.uploadDocument(name, size || 1000000, category || 'Technical', department || user.dept, classification || 'PUBLIC', tags || [], parseInt(retention || '5', 10), desc || '', parentId, author || user.name, user, ip);
            res.status(201).json(file);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static updateMetadata(req, res) {
        try {
            const { id } = req.params;
            const { name, classification, category, tags, retention, author, changeReason } = req.body;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            const file = DocumentService_1.DocumentService.updateMetadata(id, name, classification, category, tags || [], parseInt(retention || '5', 10), author || user.name, changeReason || '', user, ip);
            res.status(200).json(file);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static toggleLock(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            const file = DocumentService_1.DocumentService.toggleLock(id, user, ip);
            res.status(200).json(file);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static deleteFile(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            DocumentService_1.DocumentService.deleteDocument(id, user, ip);
            res.status(200).json({ success: true, message: 'Document deleted successfully' });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static decryptFile(req, res) {
        try {
            const { id } = req.params;
            const version = req.query.version;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            const decrypted = CryptoService_1.CryptoService.verifyAndDecrypt(id, user, ip, version);
            res.status(200).json(decrypted);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static approveDocument(req, res) {
        try {
            const { id } = req.params;
            const { approve } = req.body;
            const user = req.user;
            const ip = req.ip || '127.0.0.1';
            const file = DocumentService_1.DocumentService.approveDocument(id, !!approve, user, ip);
            res.status(200).json(file);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static downloadFile(req, res) {
        try {
            const { id } = req.params;
            const version = req.query.version;
            const user = req.user;
            let file;
            if (version) {
                file = FileRepository_1.FileRepository.findVersion(id, version);
                if (!file) {
                    res.status(404).json({ error: 'Historical version not found' });
                    return;
                }
            }
            else {
                file = FileRepository_1.FileRepository.findById(id);
                if (!file) {
                    res.status(404).json({ error: 'Document not found' });
                    return;
                }
            }
            // Check access permissions
            if (file.classification !== 'PUBLIC' && user.role !== 'SYSTEM_ADMIN' && file.author !== user.name) {
                if (!file.allowed_depts.includes(user.dept)) {
                    res.status(403).json({ error: 'Access Denied: Your department does not have access permissions for this document.' });
                    return;
                }
            }
            // Check viewer download permissions
            if (user.role === 'OFFICIAL' && user.can_edit === 0 && ['CONFIDENTIAL', 'SECRET'].includes(file.classification)) {
                res.status(403).json({ error: 'Access Denied: Read-only officials cannot download CONFIDENTIAL/SECRET files' });
                return;
            }
            // Serve download attachment
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            res.status(200).send(file.content);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static updateFolderPermissions(req, res) {
        try {
            const { id } = req.params;
            const { allowedDepts } = req.body;
            if (!allowedDepts || !Array.isArray(allowedDepts)) {
                res.status(400).json({ error: 'allowedDepts array is required' });
                return;
            }
            FolderRepository_1.FolderRepository.updateAllowedDepts(id, allowedDepts);
            res.status(200).json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
    static updateFilePermissions(req, res) {
        try {
            const { id } = req.params;
            const { allowedDepts } = req.body;
            if (!allowedDepts || !Array.isArray(allowedDepts)) {
                res.status(400).json({ error: 'allowedDepts array is required' });
                return;
            }
            FileRepository_1.FileRepository.updateAllowedDepts(id, allowedDepts);
            res.status(200).json({ success: true });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
exports.DocumentController = DocumentController;
