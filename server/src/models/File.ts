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
