import { FileRepository } from '../repositories/FileRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { File, FileVersion } from '../models/File';
import { Folder } from '../models/Folder';
import { encryptDocument, sha256 } from '../utils/cryptoUtils';
import { AuditLog } from '../models/AuditLog';

// Mock Webhook Trigger
function triggerWebhook(event: string, details: any) {
  console.log(`[Webhook Service] Dispatched event "${event}" to listeners.`, details);
}

export class DocumentService {
  static getVaultContent(folderId: string, userDept: string, userRole: string, userName: string) {
    // 1. Get child folders
    let folders = FolderRepository.findByParentId(folderId);
    if (userRole !== 'SYSTEM_ADMIN') {
      folders = folders.filter(f => f.allowed_depts.includes(userDept));
    }

    // 2. Get child files
    let files = FileRepository.findByParentId(folderId);
    if (userRole !== 'SYSTEM_ADMIN') {
      files = files.filter(f => {
        if (f.classification === 'PUBLIC') return true;
        if (f.author === userName) return true;
        return f.allowed_depts.includes(userDept);
      });
    }

    return { folders, files };
  }

  static createFolder(name: string, parentId: string, allowedDepts: string[], user: any, ip: string): Folder {
    const id = 'f-' + Math.random().toString(36).substring(2, 11);
    const folder: Folder = {
      id,
      name,
      parent_id: parentId,
      allowed_depts: allowedDepts
    };

    FolderRepository.create(folder);

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: 'Create Folder',
      resource: name,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    return folder;
  }

  static uploadDocument(
    name: string,
    size: number,
    category: string,
    department: string,
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL',
    tags: string[],
    retention: number,
    desc: string,
    parentId: string,
    author: string,
    user: any,
    ip: string
  ): File {
    if (user.role !== 'SYSTEM_ADMIN') {
      throw new Error('Access Denied: Only administrators can upload documents.');
    }

    const docId = 'doc-' + Math.random().toString(36).substring(2, 11);
    const fileType = name.split('.').pop()?.toUpperCase() || 'PDF';

    // 1. OCR text generation
    let ocrText = '';
    if (department === 'Generation') {
      ocrText = `OHPC Hydro Generating Station Operations. Balimela & Hirakud Power Plants, Unit overhaul specifications. Mechanical alignment logs, cooling water loop flow telemetry. Desc: ${desc || 'None'}`;
    } else if (department === 'Transmission') {
      ocrText = `Substation Grid Evacuation Map. Interlink blueprints for 220KV switchyard busbars. Relay protection parameters. Desc: ${desc || 'None'}`;
    } else if (department === 'Finance') {
      ocrText = `OHPC Corporate Accounts Ledger. Capital asset valuations, power purchase agreements (PPA) pricing structures. Desc: ${desc || 'None'}`;
    } else if (department === 'HR') {
      ocrText = `Human Resources Employee Charter. Staff alignment charts, reservoir safety awareness campaigns. Desc: ${desc || 'None'}`;
    } else if (department === 'IT') {
      ocrText = `DMS Server Telemetry & Cryptography Setup. Security access authorization matrices, REST API webhook integrations. Desc: ${desc || 'None'}`;
    } else {
      ocrText = `OHPC Corporate Record. Category: ${category}. Department: ${department}. Desc: ${desc || 'None'}`;
    }

    const content = desc || `OHPC system document ${name} payload. Classified as ${classification}.`;
    let ciphertext: string | undefined;
    let wrappedKey: string | undefined;
    let signature: string | undefined;

    // 2. Encryption if not public
    if (classification !== 'PUBLIC') {
      const cryptoEnvelope = encryptDocument(content, author || user.name);
      ciphertext = cryptoEnvelope.ciphertext;
      wrappedKey = cryptoEnvelope.wrappedKey;
      signature = cryptoEnvelope.signature;
    }

    const allDepts = ['Generation', 'Transmission', 'Finance', 'HR', 'IT', 'Legal'];

    const newDoc: File = {
      id: docId,
      name,
      type: fileType,
      size,
      category,
      department,
      classification,
      tags,
      version: 'v1.0',
      status: 'published', // Admin uploads: auto-published
      locked_by: null,
      retention_years: retention,
      created_time: Date.now(),
      modified_time: Date.now(),
      author: author || user.name,
      parent_id: parentId,
      ocr_text: ocrText,
      allowed_depts: allDepts,
      content,
      ciphertext,
      wrapped_key: wrappedKey,
      signature,
      versions: [
        {
          version: 'v1.0',
          author: author || user.name,
          timestamp: this.formatDate(new Date()),
          change_reason: 'Initial upload block initialization',
          name,
          type: fileType,
          size,
          category,
          classification,
          tags,
          department,
          content,
          ciphertext,
          wrapped_key: wrappedKey,
          signature
        }
      ]
    };

    FileRepository.create(newDoc);

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: 'Upload Document',
      resource: name,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    triggerWebhook('document.published', { name: newDoc.name, id: newDoc.id });

    return newDoc;
  }

  static updateMetadata(
    id: string,
    name: string,
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL',
    category: string,
    tags: string[],
    retention: number,
    author: string,
    changeReason: string,
    user: any,
    ip: string
  ): File {
    if (user.role !== 'SYSTEM_ADMIN') {
      throw new Error('Access Denied: Only administrators can edit document metadata.');
    }

    const file = FileRepository.findById(id);
    if (!file) throw new Error('File not found');

    if (file.locked_by && file.locked_by !== user.name) {
      throw new Error('File is checked out by another editor');
    }

    // Increment version (v1.0 -> v2.0)
    const match = file.version.match(/v(\d+)\.(\d+)/);
    let nextVer = 'v2.0';
    if (match) {
      const major = parseInt(match[1], 10) + 1;
      nextVer = `v${major}.0`;
    }

    file.name = name;
    file.classification = classification;
    file.category = category;
    file.tags = tags;
    file.retention_years = retention;
    file.author = author || file.author;
    file.version = nextVer;
    file.modified_time = Date.now();

    // Re-encrypt if encryption is enabled and classification isn't public
    if (classification !== 'PUBLIC') {
      const cryptoEnvelope = encryptDocument(file.content, file.author);
      file.ciphertext = cryptoEnvelope.ciphertext;
      file.wrapped_key = cryptoEnvelope.wrappedKey;
      file.signature = cryptoEnvelope.signature;
    } else {
      file.ciphertext = undefined;
      file.wrapped_key = undefined;
      file.signature = undefined;
    }

    FileRepository.updateMetadata(file);

    // Save full snapshots to version history
    const versionLog: FileVersion = {
      version: nextVer,
      author: file.author,
      timestamp: this.formatDate(new Date()),
      change_reason: changeReason || 'Metadata modifications applied',
      name: file.name,
      type: file.type,
      size: file.size,
      category: file.category,
      classification: file.classification,
      tags: file.tags,
      department: file.department,
      content: file.content,
      ciphertext: file.ciphertext,
      wrapped_key: file.wrapped_key,
      signature: file.signature
    };
    FileRepository.addVersion(id, versionLog);

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: 'Save Revision',
      resource: `${file.name} updated to ${nextVer}`,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    return file;
  }

  static toggleLock(id: string, user: any, ip: string): File {
    const file = FileRepository.findById(id);
    if (!file) throw new Error('File not found');

    let action = '';
    if (file.locked_by) {
      if (file.locked_by !== user.name && user.role !== 'SYSTEM_ADMIN') {
        throw new Error('You cannot unlock a document checked out by another editor');
      }
      file.locked_by = null;
      action = 'Unlock Document';
    } else {
      file.locked_by = user.name;
      action = 'Lock Document';
    }

    FileRepository.updateLock(id, file.locked_by);

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action,
      resource: file.name,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    return file;
  }

  static deleteDocument(id: string, user: any, ip: string): void {
    const file = FileRepository.findById(id);
    if (!file) throw new Error('File not found');

    if (file.locked_by && file.locked_by !== user.name && user.role !== 'SYSTEM_ADMIN') {
      throw new Error('File is locked by another user');
    }

    FileRepository.delete(id);

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: 'Delete Document',
      resource: file.name,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);
  }

  static approveDocument(id: string, approve: boolean, user: any, ip: string): File {
    const file = FileRepository.findById(id);
    if (!file) throw new Error('File not found');

    const status = approve ? 'published' : 'draft';
    FileRepository.updateStatus(id, status);
    file.status = status as any;

    // Audit Log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 11),
      timestamp: this.formatDate(new Date()),
      user: user.email || user.name,
      role: user.role,
      action: approve ? 'Approve Document' : 'Reject Document',
      resource: file.name,
      status: 'Success',
      ip_address: ip
    };
    AuditRepository.create(log);

    if (approve) {
      triggerWebhook('document.published', { name: file.name, id: file.id });
    }

    return file;
  }

  // Utilities
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
