import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Mount Auth Check to all document operations
router.use(authMiddleware as any);

router.get('/vault', DocumentController.getVault);
router.post('/folders', requireRole(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.createFolder);
router.post('/upload', requireRole(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.uploadFile);
router.put('/:id/metadata', requireRole(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.updateMetadata);
router.post('/:id/lock', requireRole(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.toggleLock);
router.delete('/:id', requireRole(['EDITOR', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.deleteFile);
router.post('/:id/decrypt', DocumentController.decryptFile);
router.post('/:id/approve', requireRole(['APPROVER', 'DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.approveDocument);
router.get('/:id/download', DocumentController.downloadFile);

// Permissions updates
router.put('/folders/:id/permissions', requireRole(['DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.updateFolderPermissions);
router.put('/files/:id/permissions', requireRole(['DEPT_ADMIN', 'SYSTEM_ADMIN']), DocumentController.updateFilePermissions);

export default router;
