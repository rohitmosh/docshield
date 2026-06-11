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
        if (normalized.includes('admin') || normalized.includes('sys')) {
          userId = 'sys-admin';
        } else if (normalized.includes('sasmita') || normalized.includes('mgr') || normalized.includes('manager') || normalized.includes('official') || normalized.includes('dir') || normalized.includes('exec')) {
          userId = 'official-mgr';
        } else {
          userId = 'official-mgr'; // default fallback
        }
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
          avatar: user.avatar,
          rank: user.rank,
          can_edit: user.can_edit,
          can_view_history: user.can_view_history
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
          avatar: user.avatar,
          rank: user.rank,
          can_edit: user.can_edit,
          can_view_history: user.can_view_history
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
