import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Mount Admin Guards
router.use(authMiddleware as any);
router.use(requireRole(['DEPT_ADMIN', 'SYSTEM_ADMIN']));

router.get('/expired', AdminController.getExpired);
router.post('/purge/:id', AdminController.purge);
router.get('/webhook', AdminController.getWebhook);
router.post('/webhook', AdminController.saveWebhook);
router.post('/webhook/test', AdminController.testWebhook);

export default router;
