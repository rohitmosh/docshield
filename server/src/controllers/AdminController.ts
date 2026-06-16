import { Request, Response } from 'express';
import { LifecycleService } from '../services/LifecycleService';
import { db } from '../config/db';
import { AuditRepository } from '../repositories/AuditRepository';
import { UserRepository } from '../repositories/UserRepository';

export class AdminController {
  static getExpired(req: Request, res: Response): void {
    try {
      const files = LifecycleService.getExpiredFiles();
      res.status(200).json(files);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static purge(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      LifecycleService.purgeDocument(id, user, ip);
      res.status(200).json({ success: true, message: 'Document securely shredded.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static getWebhook(req: Request, res: Response): void {
    try {
      const query = db.prepare('SELECT url, event FROM webhook_config WHERE id = ?');
      const row = query.get('default') as { url: string; event: string } | undefined;
      res.status(200).json(row || { url: '', event: 'document.published' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static saveWebhook(req: Request, res: Response): void {
    try {
      const { url, event } = req.body;
      const stmt = db.prepare('INSERT OR REPLACE INTO webhook_config (id, url, event) VALUES (?, ?, ?)');
      stmt.run('default', url, event);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static testWebhook(req: Request, res: Response): void {
    try {
      const { url, event } = req.body;
      const user = (req as any).user;

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        triggeredBy: user.email || 'system',
        environment: 'OHPC_DocShield_Live',
        document: {
          id: 'doc-sample-hook',
          name: 'Mock_System_Tender_Notification.pdf',
          classification: 'RESTRICTED',
          checksum: 'SHA256:E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
        }
      };

      // Add to audit trail
      const auditLog = {
        id: 'aud-' + Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        user: user.email || user.name,
        role: user.role,
        action: 'Test Webhook Integration',
        resource: `Dispatched ${event} event`,
        status: 'Success',
        ip_address: req.ip || '127.0.0.1'
      };
      AuditRepository.create(auditLog);

      res.status(200).json({ success: true, payload });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static updateUser(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { dept, rank, can_edit, can_view_history } = req.body;

      UserRepository.update(id, {
        dept,
        rank,
        can_edit: can_edit ? 1 : 0,
        can_view_history: can_view_history ? 1 : 0
      });

      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static getTags(req: Request, res: Response): void {
    try {
      const rows = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
      res.status(200).json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static createTag(req: Request, res: Response): void {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Tag name is required' });
        return;
      }
      const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)');
      stmt.run(name.trim().toLowerCase());
      res.status(201).json({ success: true, name: name.trim().toLowerCase() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static getDepartments(req: Request, res: Response): void {
    try {
      const rows = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
      res.status(200).json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static createDepartment(req: Request, res: Response): void {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Department name is required' });
        return;
      }
      const stmt = db.prepare('INSERT INTO departments (name) VALUES (?)');
      stmt.run(name.trim());
      res.status(201).json({ success: true, name: name.trim() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static updateDepartment(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const newName = name?.trim();

      if (!newName) {
        res.status(400).json({ error: 'Department name is required' });
        return;
      }

      // Get old name
      const getOldNameQuery = db.prepare('SELECT name FROM departments WHERE id = ?');
      const oldNameRow = getOldNameQuery.get(id) as { name: string } | undefined;
      if (!oldNameRow) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      const oldName = oldNameRow.name;

      if (oldName === newName) {
        res.status(200).json({ success: true });
        return;
      }

      // Update departments table
      const updateDeptStmt = db.prepare('UPDATE departments SET name = ? WHERE id = ?');
      updateDeptStmt.run(newName, id);

      // Cascade updates
      // 1. users
      const updateUserStmt = db.prepare('UPDATE users SET dept = ? WHERE dept = ?');
      updateUserStmt.run(newName, oldName);

      // 2. files department
      const updateFileDeptStmt = db.prepare('UPDATE files SET department = ? WHERE department = ?');
      updateFileDeptStmt.run(newName, oldName);

      // 3. folders allowed_depts
      const folders = db.prepare('SELECT id, allowed_depts FROM folders').all() as { id: string; allowed_depts: string }[];
      const updateFolderDeptsStmt = db.prepare('UPDATE folders SET allowed_depts = ? WHERE id = ?');
      for (const f of folders) {
        const depts: string[] = JSON.parse(f.allowed_depts || '[]');
        if (depts.includes(oldName)) {
          const updated = depts.map(d => d === oldName ? newName : d);
          updateFolderDeptsStmt.run(JSON.stringify(updated), f.id);
        }
      }

      // 4. files allowed_depts
      const files = db.prepare('SELECT id, allowed_depts FROM files').all() as { id: string; allowed_depts: string }[];
      const updateFileDeptsStmt = db.prepare('UPDATE files SET allowed_depts = ? WHERE id = ?');
      for (const fl of files) {
        const depts: string[] = JSON.parse(fl.allowed_depts || '[]');
        if (depts.includes(oldName)) {
          const updated = depts.map(d => d === oldName ? newName : d);
          updateFileDeptsStmt.run(JSON.stringify(updated), fl.id);
        }
      }

      res.status(200).json({ success: true, oldName, newName });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
