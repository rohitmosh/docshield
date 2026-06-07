import { FileRepository } from '../repositories/FileRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { decryptDocument, sha256 } from '../utils/cryptoUtils';
import { AuditLog } from '../models/AuditLog';

export class CryptoService {
  static verifyAndDecrypt(docId: string, user: any, ip: string) {
    const file = FileRepository.findById(docId);
    if (!file) throw new Error('File not found');

    if (file.classification === 'PUBLIC') {
      return {
        verified: true,
        content: file.content,
        checksum: sha256(file.name + file.size),
        message: 'Public document requires no cryptographic envelope decryption.'
      };
    }

    if (!file.ciphertext || !file.wrapped_key || !file.signature) {
      throw new Error('Document is missing key security wrapper metadata blocks');
    }

    try {
      // Execute Node.js native RSA unwrap + AES-GCM verification decipher
      const decryptedContent = decryptDocument({
        ciphertext: file.ciphertext,
        wrappedKey: file.wrapped_key,
        signature: file.signature
      });

      // Audit Log
      const log: AuditLog = {
        id: 'aud-' + Math.random().toString(36).substring(2, 11),
        timestamp: this.formatDate(new Date()),
        user: user.email || user.name,
        role: user.role,
        action: 'Verify Cryptographic Envelope',
        resource: file.name,
        status: 'Success',
        ip_address: ip
      };
      AuditRepository.create(log);

      return {
        verified: true,
        content: decryptedContent,
        checksum: sha256(file.name + file.size),
        signature: file.signature,
        wrappedKey: file.wrapped_key
      };
    } catch (e: any) {
      // Audit Log Failure
      const log: AuditLog = {
        id: 'aud-' + Math.random().toString(36).substring(2, 11),
        timestamp: this.formatDate(new Date()),
        user: user.email || user.name,
        role: user.role,
        action: 'Verify Cryptographic Envelope',
        resource: file.name,
        status: 'Failure: Decrypt Refused',
        ip_address: ip
      };
      AuditRepository.create(log);

      throw new Error(`Envelope Verification Failed: ${e.message}`);
    }
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
