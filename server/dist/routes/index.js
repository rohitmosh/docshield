"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const documentRoutes_1 = __importDefault(require("./documentRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const auditRoutes_1 = __importDefault(require("./auditRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/documents', documentRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/audit', auditRoutes_1.default);
exports.default = router;
