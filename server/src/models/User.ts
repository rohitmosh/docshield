export interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ANONYMOUS' | 'OFFICIAL' | 'SYSTEM_ADMIN';
  dept: string;
  avatar: string;
  rank?: string;
  can_edit?: number;
  can_approve?: number;
  created_at?: string;
}

