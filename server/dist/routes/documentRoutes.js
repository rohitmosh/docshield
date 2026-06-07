"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentController_1 = require("../controllers/DocumentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Mount Auth Check to all document operations
router.use(authMiddleware_1.authMiddleware);
router.get('/vault', DocumentController_1.DocumentController.getVault);
router.post('/folders', (0, authMiddleware_1.requireRole)(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.createFolder);
router.post('/upload', (0, authMiddleware_1.requireRole)(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.uploadFile);
router.put('/:id/metadata', (0, authMiddleware_1.requireRole)(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.updateMetadata);
router.post('/:id/lock', (0, authMiddleware_1.requireRole)(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.toggleLock);
router.delete('/:id', (0, authMiddleware_1.requireRole)(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.deleteFile);
router.post('/:id/decrypt', DocumentController_1.DocumentController.decryptFile);
router.post('/:id/approve', (0, authMiddleware_1.requireRole)(['APPROVER', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.approveDocument);
router.get('/:id/download', DocumentController_1.DocumentController.downloadFile);
// Permissions updates
router.put('/folders/:id/permissions', (0, authMiddleware_1.requireRole)(['DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.updateFolderPermissions);
router.put('/files/:id/permissions', (0, authMiddleware_1.requireRole)(['DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController_1.DocumentController.updateFilePermissions);
exports.default = router;
