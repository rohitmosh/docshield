export interface Folder {
  id: string;
  name: string;
  parent_id: string;
  allowed_depts: string[]; // Decoded JSON array
  allowed_users?: string[]; // Decoded JSON array of user IDs
  created_at?: string;
}
