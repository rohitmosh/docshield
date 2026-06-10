import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Mount Admin Guards
router.use(authMiddleware as any);
router.use(requireAdmin as any);

router.get('/expired', AdminController.getExpired);
router.post('/purge/:id', AdminController.purge);
router.get('/webhook', AdminController.getWebhook);
router.post('/webhook', AdminController.saveWebhook);
router.post('/webhook/test', AdminController.testWebhook);
router.put('/users/:id', AdminController.updateUser);

router.get('/tags', AdminController.getTags);
router.post('/tags', AdminController.createTag);
router.get('/departments', AdminController.getDepartments);
router.post('/departments', AdminController.createDepartment);

export default router;
