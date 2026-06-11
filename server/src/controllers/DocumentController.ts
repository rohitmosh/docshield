import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { CryptoService } from '../services/CryptoService';
import { FileRepository } from '../repositories/FileRepository';
import { FolderRepository } from '../repositories/FolderRepository';

export class DocumentController {
  static getVault(req: Request, res: Response): void {
    try {
      const folderId = (req.query.folderId as string) || 'root';
      const all = req.query.all === 'true';
      const user = (req as any).user;
      const canViewHistory = user.role === 'SYSTEM_ADMIN' || user.can_view_history === 1;

      if (all) {
        let files = FileRepository.findAll();
        if (user.role !== 'SYSTEM_ADMIN') {
          files = files.filter(f => f.classification === 'PUBLIC' || f.author === user.name || f.allowed_depts.includes(user.dept));
        }
        if (!canViewHistory) {
          files = files.map(f => ({ ...f, versions: [] }));
        }
        res.status(200).json({ files });
      } else {
        const content = DocumentService.getVaultContent(folderId, user.dept, user.role, user.name);
        if (!canViewHistory) {
          content.files = content.files.map(f => ({ ...f, versions: [] }));
        }
        res.status(200).json(content);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static createFolder(req: Request, res: Response): void {
    try {
      const { name, parentId, allowedDepts } = req.body;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      if (!name || !parentId) {
        res.status(400).json({ error: 'Folder name and parent ID are required' });
        return;
      }

      const folder = DocumentService.createFolder(
        name,
        parentId,
        allowedDepts || ['Generation', 'Transmission', 'Finance', 'HR', 'IT', 'Legal'],
        user,
        ip
      );

      res.status(201).json(folder);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static uploadFile(req: Request, res: Response): void {
    try {
      const { name, size, category, department, classification, tags, retention, desc, parentId, author } = req.body;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      if (!name || !parentId) {
        res.status(400).json({ error: 'File name and parent ID are required' });
        return;
      }

      const file = DocumentService.uploadDocument(
        name,
        size || 1000000,
        category || 'Technical',
        department || user.dept,
        classification || 'PUBLIC',
        tags || [],
        parseInt(retention || '5', 10),
        desc || '',
        parentId,
        author || user.name,
        user,
        ip
      );

      res.status(201).json(file);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static updateMetadata(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { name, classification, category, tags, retention, author, changeReason } = req.body;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      const file = DocumentService.updateMetadata(
        id,
        name,
        classification,
        category,
        tags || [],
        parseInt(retention || '5', 10),
        author || user.name,
        changeReason || '',
        user,
        ip
      );

      res.status(200).json(file);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static toggleLock(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      const file = DocumentService.toggleLock(id, user, ip);
      res.status(200).json(file);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static deleteFile(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      DocumentService.deleteDocument(id, user, ip);
      res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static decryptFile(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const version = req.query.version as string;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      const decrypted = CryptoService.verifyAndDecrypt(id, user, ip, version);
      res.status(200).json(decrypted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static approveDocument(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { approve } = req.body;
      const user = (req as any).user;
      const ip = req.ip || '127.0.0.1';

      const file = DocumentService.approveDocument(id, !!approve, user, ip);
      res.status(200).json(file);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static downloadFile(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const version = req.query.version as string;
      const user = (req as any).user;

      let file: any;
      if (version) {
        const canViewHistory = user.role === 'SYSTEM_ADMIN' || user.can_view_history === 1;
        if (!canViewHistory) {
          res.status(403).json({ error: 'Access Denied: You do not have permissions to download historical versions.' });
          return;
        }
        file = FileRepository.findVersion(id, version);
        if (!file) {
          res.status(404).json({ error: 'Historical version not found' });
          return;
        }
      } else {
        file = FileRepository.findById(id);
        if (!file) {
          res.status(404).json({ error: 'Document not found' });
          return;
        }
      }

      // Check access permissions
      if (file.classification !== 'PUBLIC' && user.role !== 'SYSTEM_ADMIN' && file.author !== user.name) {
        if (!file.allowed_depts.includes(user.dept)) {
          res.status(403).json({ error: 'Access Denied: Your department does not have access permissions for this document.' });
          return;
        }
      }

      // Check viewer download permissions
      if (user.role === 'OFFICIAL' && user.can_edit === 0 && ['CONFIDENTIAL', 'SECRET'].includes(file.classification)) {
        res.status(403).json({ error: 'Access Denied: Read-only officials cannot download CONFIDENTIAL/SECRET files' });
        return;
      }

      // Serve download attachment
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      res.status(200).send(file.content);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static updateFolderPermissions(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { allowedDepts } = req.body;

      if (!allowedDepts || !Array.isArray(allowedDepts)) {
        res.status(400).json({ error: 'allowedDepts array is required' });
        return;
      }

      FolderRepository.updateAllowedDepts(id, allowedDepts);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static updateFilePermissions(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { allowedDepts } = req.body;

      if (!allowedDepts || !Array.isArray(allowedDepts)) {
        res.status(400).json({ error: 'allowedDepts array is required' });
        return;
      }

      FileRepository.updateAllowedDepts(id, allowedDepts);
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
