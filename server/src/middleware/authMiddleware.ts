import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string | null;
    role: string;
    dept: string;
    avatar: string;
    rank?: string;
    can_edit?: number;
    can_view_history?: number;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authorization token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export function requireEdit(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role === 'SYSTEM_ADMIN' || req.user.can_edit === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: You do not have edit permissions.' });
  }
}

export function requireViewHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role === 'SYSTEM_ADMIN' || req.user.can_view_history === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: You do not have permission to view version history.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role === 'SYSTEM_ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: System Administrator privilege required.' });
  }
}
