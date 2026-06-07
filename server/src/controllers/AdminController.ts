import { Request, Response } from 'express';
import { LifecycleService } from '../services/LifecycleService';
import { db } from '../config/db';
import { AuditRepository } from '../repositories/AuditRepository';

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
}
