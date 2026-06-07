import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Mount Audit Guards
router.use(authMiddleware as any);
router.use(requireRole(['DEPT_ADMIN', 'SYSTEM_ADMIN']));

router.get('/logs', AuditController.getLogs);
router.get('/export', AuditController.exportCSV);

export default router;
