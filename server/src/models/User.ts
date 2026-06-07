export interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ANONYMOUS' | 'VIEWER' | 'EDITOR' | 'APPROVER' | 'DEPT_ADMIN' | 'SYSTEM_ADMIN';
  dept: string;
  avatar: string;
  created_at?: string;
}
