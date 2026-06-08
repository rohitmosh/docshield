import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { authMiddleware, requireEdit, requireApprove, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Mount Auth Check to all document operations
router.use(authMiddleware as any);

router.get('/vault', DocumentController.getVault);
router.post('/folders', requireEdit as any, DocumentController.createFolder);
router.post('/upload', requireEdit as any, DocumentController.uploadFile);
router.put('/:id/metadata', requireEdit as any, DocumentController.updateMetadata);
router.post('/:id/lock', requireEdit as any, DocumentController.toggleLock);
router.delete('/:id', requireEdit as any, DocumentController.deleteFile);
router.post('/:id/decrypt', DocumentController.decryptFile);
router.post('/:id/approve', requireApprove as any, DocumentController.approveDocument);
router.get('/:id/download', DocumentController.downloadFile);

// Permissions updates
router.put('/folders/:id/permissions', requireAdmin as any, DocumentController.updateFolderPermissions);
router.put('/files/:id/permissions', requireAdmin as any, DocumentController.updateFilePermissions);

export default router;
