export type AdminMenuTab = 
  | 'DASHBOARD'
  | 'POSTS'
  | 'REPORTS'
  | 'USERS'
  | 'ROOMS'
  | 'AI_SETTINGS';

export interface AdminProfile {
  username: string;
  avatar_url: string;
  role?: string;
}
