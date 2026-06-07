export interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ANONYMOUS' | 'VIEWER' | 'EDITOR' | 'APPROVER' | 'DEPT_ADMIN' | 'SYSTEM_ADMIN';
  dept: string;
  avatar: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string;
  allowed_depts: string[];
  created_at?: string;
}

export interface FileVersion {
  version: string;
  author: string;
  timestamp: string;
  change_reason: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  department: string;
  classification: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  tags: string[];
  version: string;
  status: 'published' | 'pending' | 'draft';
  locked_by: string | null;
  retention_years: number;
  created_time: number;
  modified_time: number;
  author: string;
  parent_id: string;
  ocr_text: string;
  allowed_depts: string[];
  content: string;
  ciphertext?: string;
  wrapped_key?: string;
  signature?: string;
  versions?: FileVersion[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  status: string;
  ip_address: string;
}

export interface WebhookConfig {
  url: string;
  event: string;
}
