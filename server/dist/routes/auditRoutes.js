"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditController_1 = require("../controllers/AuditController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Mount Audit Guards
router.use(authMiddleware_1.authMiddleware);
router.use((0, authMiddleware_1.requireRole)(['DEPT_ADMIN', 'SYSTEM_ADMIN']));
router.get('/logs', AuditController_1.AuditController.getLogs);
router.get('/export', AuditController_1.AuditController.exportCSV);
exports.default = router;
