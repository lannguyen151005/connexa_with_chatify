export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DELETED';

export type UserLockDuration = 3 | 7 | 30 | 'PERMANENT';

export interface UserLockInfo {
  isLocked: boolean;
  reason: string;
  lockedAt: string;
  lockedUntil: string | null; // null biểu thị Khóa vĩnh viễn
  lockedBy: string;
}

export interface UserMetrics {
  postsCount: number;
  friendsCount: number;
  violationsCount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  metrics: UserMetrics;
  lockInfo?: UserLockInfo | null;
}

export interface PaginatedUsersResponse {
  items: AdminUser[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  isMock?: boolean;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  status?: UserStatus | 'ALL';
  role?: UserRole | 'ALL';
  keyword?: string;
}

export interface LockUserPayload {
  duration: UserLockDuration;
  reason: string;
}
