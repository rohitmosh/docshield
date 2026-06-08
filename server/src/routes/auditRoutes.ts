import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Mount Audit Guards
router.use(authMiddleware as any);
router.use(requireAdmin as any);

router.get('/logs', AuditController.getLogs);
router.get('/export', AuditController.exportCSV);

export default router;
