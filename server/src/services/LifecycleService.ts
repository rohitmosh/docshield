import { FileRepository } from '../repositories/FileRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { sha256 } from '../utils/cryptoUtils';
import { AuditLog } from '../models/AuditLog';

export class LifecycleService {
  static getExpiredFiles(): any[] {
    const files = FileRepository.findAll();
    const now = Date.now();

    return files.filter(doc => {
      if (doc.retention_years === 99) return false; // Permanent archive
      const retentionMs = doc.retention_years * 365.25 * 24 * 60 * 60 * 1000;
      return (doc.created_time + retentionMs) < now;
    });
  }

  static purgeDocument(id: string, user: any, ip: string): void {
    const file = FileRepository.findById(id);
    if (!file) throw new Error('File not found');

    const hash = sha256(file.name + file.size);

    // Hard delete file from databases
    FileRepository.delete(id);

    // Audit Log: Immutable Certificate of Destruction
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: 'Secure Purge (Certificate of Destruction)',
      resource: `${file.name} (SHA256:${hash} Shredded)`,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    console.log(`[Lifecycle Service] Secure purge executed. File ${file.name} shredded.`);
  }

  private static formatDate(now: Date): string {
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hrs}:${mins}:${secs}`;
  }
}
