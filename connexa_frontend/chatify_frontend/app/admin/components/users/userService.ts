import api from '../../../utils/api';
import {
  AdminUser,
  LockUserPayload,
  PaginatedUsersResponse,
  UserFilterParams,
} from './types';
import {
  getMockPaginatedUsers,
  mockDeleteUser,
  mockLockUser,
  mockUnlockUser,
} from './mockUsers';

export const isUsersMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_USERS_MOCK === 'true';
};

export const fetchAdminUsers = async (
  params: UserFilterParams = {}
): Promise<PaginatedUsersResponse> => {
  if (isUsersMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getMockPaginatedUsers(params);
  }

  // Gọi endpoint gốc hiện có của Backend Quarkus
  const res = await api.get('/api/admin/users/list');
  const rawList: any[] = Array.isArray(res.data) ? res.data : (res.data?.items || []);

  // Chuẩn hóa dữ liệu trả về từ Quarkus sang AdminUser
  const mappedList: AdminUser[] = rawList.map((item) => ({
    id: item.id || String(item.userId || Math.random()),
    username: item.username || 'Unknown',
    email: item.email || '',
    avatarUrl: item.avatar_url || item.avatarUrl || null,
    role: item.role === 'ADMIN' ? 'ADMIN' : 'USER',
    status: item.username === 'Người dùng đã xóa' ? 'DELETED' : (item.status === 'LOCKED' ? 'LOCKED' : 'ACTIVE'),
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    metrics: {
      postsCount: item.postsCount ?? (item.metrics?.postsCount || 0),
      friendsCount: item.friendsCount ?? (item.metrics?.friendsCount || 0),
      violationsCount: item.violationsCount ?? (item.metrics?.violationsCount || 0),
    },
    lockInfo: item.lockInfo || null,
  }));

  // Lọc và phân trang client-side dự phòng nếu Quarkus chưa hỗ trợ query param
  let filtered = [...mappedList];
  if (params.status && params.status !== 'ALL') {
    filtered = filtered.filter((u) => u.status === params.status);
  }
  if (params.role && params.role !== 'ALL') {
    filtered = filtered.filter((u) => u.role === params.role);
  }
  if (params.keyword) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw)
    );
  }

  const page = params.page ?? 0;
  const size = params.size ?? 6;
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const startIndex = page * size;
  const items = filtered.slice(startIndex, startIndex + size);

  return {
    items,
    totalElements,
    totalPages,
    page,
    size,
    isMock: false,
  };
};

export const lockUserApi = async (
  userId: string,
  payload: LockUserPayload
): Promise<AdminUser | null> => {
  if (isUsersMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockLockUser(userId, payload.duration, payload.reason);
  }

  const res = await api.patch(`/api/admin/users/${userId}/lock`, payload);
  return res.data;
};

export const unlockUserApi = async (userId: string): Promise<AdminUser | null> => {
  if (isUsersMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockUnlockUser(userId);
  }

  const res = await api.patch(`/api/admin/users/${userId}/unlock`);
  return res.data;
};

export const deleteUserApi = async (userId: string): Promise<boolean> => {
  if (isUsersMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDeleteUser(userId);
  }

  // Kế thừa API xóa hiện có của nhóm
  await api.delete(`/api/admin/users/${userId}`);
  return true;
};
