export interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ANONYMOUS' | 'OFFICIAL' | 'SYSTEM_ADMIN';
  dept: string;
  avatar: string;
  rank?: string;
  can_edit?: number;
  can_view_history?: number;
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
  name: string;
  type: string;
  size: number;
  category: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  tags: string[];
  department: string;
  content: string;
  ciphertext?: string;
  wrapped_key?: string;
  signature?: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  department: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
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
