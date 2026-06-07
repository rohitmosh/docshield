export interface Folder {
  id: string;
  name: string;
  parent_id: string;
  allowed_depts: string[]; // Decoded JSON array
  created_at?: string;
}
