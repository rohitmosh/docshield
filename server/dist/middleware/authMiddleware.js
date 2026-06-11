"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
exports.requireEdit = requireEdit;
exports.requireViewHistory = requireViewHistory;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === 'null') {
        req.user = {
            id: 'anonymous',
            name: 'Public Visitor',
            email: null,
            role: 'ANONYMOUS',
            dept: 'Public',
            avatar: 'PV',
            rank: 'Guest',
            can_edit: 0,
            can_view_history: 0
        };
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Access Denied: Insufficient security role authorization clearance' });
            return;
        }
        next();
    };
}
function requireEdit(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role === 'SYSTEM_ADMIN' || req.user.can_edit === 1) {
        next();
    }
    else {
        res.status(403).json({ error: 'Access Denied: You do not have edit permissions.' });
    }
}
function requireViewHistory(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role === 'SYSTEM_ADMIN' || req.user.can_view_history === 1) {
        next();
    }
    else {
        res.status(403).json({ error: 'Access Denied: You do not have permission to view version history.' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role === 'SYSTEM_ADMIN') {
        next();
    }
    else {
        res.status(403).json({ error: 'Access Denied: System Administrator privilege required.' });
    }
}
