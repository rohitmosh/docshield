import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { env } from '../config/env';

export class AuthController {
  static login(req: Request, res: Response): void {
    try {
      const { roleKey, username } = req.body;

      let userId = roleKey;
      
      // Fallback matching for text input box login
      if (username) {
        const normalized = username.trim().toLowerCase();
        if (normalized.startsWith('viewer')) userId = 'viewer';
        else if (normalized.startsWith('editor')) userId = 'editor';
        else if (normalized.startsWith('approver')) userId = 'approver';
        else if (normalized.startsWith('dept-admin')) userId = 'dept-admin';
        else if (normalized.startsWith('admin') || normalized.startsWith('sys')) userId = 'sys-admin';
        else userId = 'viewer'; // default fallback
      }

      if (!userId) {
        res.status(400).json({ error: 'Authentication payload requires roleKey or username' });
        return;
      }

      const user = UserRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User credential profile not found' });
        return;
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dept: user.dept,
          avatar: user.avatar
        },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dept: user.dept,
          avatar: user.avatar
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static getProfiles(req: Request, res: Response): void {
    try {
      const profiles = UserRepository.findAll();
      res.status(200).json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
