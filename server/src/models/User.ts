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
  created_at?: string;
}

