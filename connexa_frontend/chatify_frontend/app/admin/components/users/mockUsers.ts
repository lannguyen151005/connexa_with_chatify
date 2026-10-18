import { AdminUser, PaginatedUsersResponse, UserFilterParams, UserLockDuration } from './types';

export let MOCK_USERS_DATABASE: AdminUser[] = [
  {
    id: "usr-01",
    username: "admin_he_thong",
    email: "admin@connexa.social",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-15T00:00:00Z",
    metrics: {
      postsCount: 5,
      friendsCount: 250,
      violationsCount: 0,
    },
    lockInfo: null,
  },
  {
    id: "usr-02",
    username: "thao_nguyen",
    email: "thao.nguyen@example.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-03-20T10:30:00Z",
    metrics: {
      postsCount: 24,
      friendsCount: 86,
      violationsCount: 0,
    },
    lockInfo: null,
  },
  {
    id: "usr-03",
    username: "tai_khoan_spam",
    email: "spammer99@tempmail.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp",
    role: "USER",
    status: "LOCKED",
    createdAt: "2026-08-10T14:20:00Z",
    metrics: {
      postsCount: 3,
      friendsCount: 5,
      violationsCount: 6,
    },
    lockInfo: {
      isLocked: true,
      reason: "Spam quảng cáo và lừa đảo đầu tư tài chính.",
      lockedAt: "2026-10-17T09:00:00Z",
      lockedUntil: "2026-10-24T09:00:00Z", // Khóa 7 ngày
      lockedBy: "admin_he_thong",
    },
  },
  {
    id: "usr-04",
    username: "hoang_minh_tech",
    email: "hoangminh.dev@example.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-04-05T08:15:00Z",
    metrics: {
      postsCount: 42,
      friendsCount: 115,
      violationsCount: 0,
    },
    lockInfo: null,
  },
  {
    id: "usr-05",
    username: "nghi_van_lua_dao",
    email: "veconcert500k@gmail.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp",
    role: "USER",
    status: "LOCKED",
    createdAt: "2026-09-01T11:45:00Z",
    metrics: {
      postsCount: 1,
      friendsCount: 2,
      violationsCount: 4,
    },
    lockInfo: {
      isLocked: true,
      reason: "Bán vé giả và có dấu hiệu chiếm đoạt tiền đặt cọc.",
      lockedAt: "2026-10-18T08:00:00Z",
      lockedUntil: "2026-11-17T08:00:00Z", // Khóa 30 ngày
      lockedBy: "admin_dev",
    },
  },
  {
    id: "usr-06",
    username: "lan_anh_design",
    email: "lananh.ui@example.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-05-12T16:00:00Z",
    metrics: {
      postsCount: 38,
      friendsCount: 142,
      violationsCount: 0,
    },
    lockInfo: null,
  },
  {
    id: "usr-07",
    username: "quoc_tuan",
    email: "quoctuan.student@example.com",
    avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-06-22T09:20:00Z",
    metrics: {
      postsCount: 19,
      friendsCount: 64,
      violationsCount: 0,
    },
    lockInfo: null,
  },
  {
    id: "usr-08",
    username: "Người dùng đã xóa",
    email: "ghost_usr08@deleted.local",
    avatarUrl: null,
    role: "USER",
    status: "DELETED",
    createdAt: "2026-02-18T13:10:00Z",
    metrics: {
      postsCount: 0,
      friendsCount: 0,
      violationsCount: 8,
    },
    lockInfo: null,
  },
];

export function getMockPaginatedUsers(params: UserFilterParams): PaginatedUsersResponse {
  const page = params.page ?? 0;
  const size = params.size ?? 6;
  const status = params.status || 'ALL';
  const role = params.role || 'ALL';
  const keyword = (params.keyword || '').trim().toLowerCase();

  let filtered = [...MOCK_USERS_DATABASE];

  // Lọc theo trạng thái
  if (status !== 'ALL') {
    filtered = filtered.filter((u) => u.status === status);
  }

  // Lọc theo vai trò
  if (role !== 'ALL') {
    filtered = filtered.filter((u) => u.role === role);
  }

  // Lọc theo từ khóa (username hoặc email)
  if (keyword) {
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        u.id.toLowerCase().includes(keyword)
    );
  }

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
    isMock: true,
  };
}

export function mockLockUser(
  userId: string,
  duration: UserLockDuration,
  reason: string
): AdminUser | null {
  const target = MOCK_USERS_DATABASE.find((u) => u.id === userId);
  if (!target) return null;

  let lockedUntil: string | null = null;
  if (duration !== 'PERMANENT') {
    const d = new Date();
    d.setDate(d.getDate() + duration);
    lockedUntil = d.toISOString();
  }

  target.status = 'LOCKED';
  target.lockInfo = {
    isLocked: true,
    reason: reason || 'Vi phạm tiêu chuẩn cộng đồng Connexa.',
    lockedAt: new Date().toISOString(),
    lockedUntil,
    lockedBy: 'admin_dev',
  };

  return { ...target };
}

export function mockUnlockUser(userId: string): AdminUser | null {
  const target = MOCK_USERS_DATABASE.find((u) => u.id === userId);
  if (!target) return null;

  target.status = 'ACTIVE';
  target.lockInfo = null;

  return { ...target };
}

export function mockDeleteUser(userId: string): boolean {
  const target = MOCK_USERS_DATABASE.find((u) => u.id === userId);
  if (!target) return false;

  target.username = 'Người dùng đã xóa';
  target.status = 'DELETED';
  target.avatarUrl = null;
  target.lockInfo = null;

  return true;
}
