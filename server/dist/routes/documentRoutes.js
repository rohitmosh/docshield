"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentController_1 = require("../controllers/DocumentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Mount Auth Check to all document operations
router.use(authMiddleware_1.authMiddleware);
router.get('/vault', DocumentController_1.DocumentController.getVault);
router.post('/folders', authMiddleware_1.requireEdit, DocumentController_1.DocumentController.createFolder);
router.post('/upload', authMiddleware_1.requireAdmin, DocumentController_1.DocumentController.uploadFile);
router.put('/:id/metadata', authMiddleware_1.requireEdit, DocumentController_1.DocumentController.updateMetadata);
router.post('/:id/lock', authMiddleware_1.requireEdit, DocumentController_1.DocumentController.toggleLock);
router.delete('/:id', authMiddleware_1.requireEdit, DocumentController_1.DocumentController.deleteFile);
router.post('/:id/decrypt', DocumentController_1.DocumentController.decryptFile);
router.post('/:id/approve', authMiddleware_1.requireViewHistory, DocumentController_1.DocumentController.approveDocument);
router.get('/:id/download', DocumentController_1.DocumentController.downloadFile);
// Permissions updates
router.put('/folders/:id/permissions', authMiddleware_1.requireAdmin, DocumentController_1.DocumentController.updateFolderPermissions);
router.put('/files/:id/permissions', authMiddleware_1.requireAdmin, DocumentController_1.DocumentController.updateFilePermissions);
router.delete('/folders/:id', authMiddleware_1.requireAdmin, DocumentController_1.DocumentController.deleteFolder);
exports.default = router;
