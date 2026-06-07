import { Request, Response } from 'express';
import { AuditRepository } from '../repositories/AuditRepository';

export class AuditController {
  static getLogs(req: Request, res: Response): void {
    try {
      const action = req.query.action as string | undefined;
      const logs = AuditRepository.findAll(action);
      res.status(200).json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static exportCSV(req: Request, res: Response): void {
    try {
      const logs = AuditRepository.findAll();
      
      let csv = 'Timestamp,User,Security Role,Action,Resource Context,Status,IP Address\r\n';
      logs.forEach(log => {
        csv += `"${log.timestamp}","${log.user}","${log.role}","${log.action}","${log.resource}","${log.status}","${log.ip_address}"\r\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="DocShield_Audit_Ledger_${new Date().toISOString().substring(0, 10)}.csv"`);
      res.status(200).send(csv);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
