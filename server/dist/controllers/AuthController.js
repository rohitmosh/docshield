"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const env_1 = require("../config/env");
class AuthController {
    static login(req, res) {
        try {
            const { roleKey, username } = req.body;
            let userId = roleKey;
            // Fallback matching for text input box login
            if (username) {
                const normalized = username.trim().toLowerCase();
                const users = UserRepository_1.UserRepository.findAll();
                const matched = users.find(u => u.id.toLowerCase() === normalized || (u.email && u.email.toLowerCase() === normalized));
                if (matched) {
                    userId = matched.id;
                }
                else if (normalized.includes('admin') || normalized.includes('sys')) {
                    userId = 'sys-admin';
                }
                else if (normalized.includes('sasmita') || normalized.includes('mgr') || normalized.includes('manager') || normalized.includes('official') || normalized.includes('dir') || normalized.includes('exec')) {
                    userId = 'official-mgr';
                }
                else {
                    userId = 'official-mgr'; // default fallback
                }
            }
            if (!userId) {
                res.status(400).json({ error: 'Authentication payload requires roleKey or username' });
                return;
            }
            const user = UserRepository_1.UserRepository.findById(userId);
            if (!user) {
                res.status(404).json({ error: 'User credential profile not found' });
                return;
            }
            // Generate JWT Token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dept: user.dept,
                avatar: user.avatar,
                rank: user.rank,
                can_edit: user.can_edit,
                can_view_history: user.can_view_history
            }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    dept: user.dept,
                    avatar: user.avatar,
                    rank: user.rank,
                    can_edit: user.can_edit,
                    can_view_history: user.can_view_history
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static getProfiles(req, res) {
        try {
            const profiles = UserRepository_1.UserRepository.findAll();
            res.status(200).json(profiles);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
