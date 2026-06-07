"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Mount Admin Guards
router.use(authMiddleware_1.authMiddleware);
router.use((0, authMiddleware_1.requireRole)(['DEPT_ADMIN', 'SYSTEM_ADMIN']));
router.get('/expired', AdminController_1.AdminController.getExpired);
router.post('/purge/:id', AdminController_1.AdminController.purge);
router.get('/webhook', AdminController_1.AdminController.getWebhook);
router.post('/webhook', AdminController_1.AdminController.saveWebhook);
router.post('/webhook/test', AdminController_1.AdminController.testWebhook);
exports.default = router;
