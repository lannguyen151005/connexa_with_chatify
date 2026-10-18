import { AdminRoom, CloseRoomPayload, RoomFilterParams, RoomListResponse } from './types';

export const INITIAL_MOCK_ROOMS: AdminRoom[] = [
  {
    id: "room-sys-001",
    title: "Kênh Thông Báo Chung Toàn Trường",
    type: "GROUP",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&auto=format&fit=crop&q=80",
    creator: {
      id: "user-admin-001",
      username: "admin_connexa",
      fullName: "Ban Quản Trị Connexa",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 1280,
    members: [
      {
        id: "user-admin-001",
        username: "admin_connexa",
        fullName: "Ban Quản Trị Connexa",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-01-01T08:00:00Z",
      },
      {
        id: "user-dev-001",
        username: "hoanglong.dev",
        fullName: "Lê Hoàng Long",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-02-10T09:30:00Z",
      },
    ],
    messageCount: 520,
    lastActiveAt: "2026-10-18T14:30:00Z",
    createdAt: "2026-01-01T08:00:00Z",
    isProtected: true, // Phòng hệ thống không thể xóa/đóng
  },
  {
    id: "room-grp-002",
    title: "K64 - Công Nghệ Thông Tin",
    type: "GROUP",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&auto=format&fit=crop&q=80",
    creator: {
      id: "user-dev-001",
      username: "hoanglong.dev",
      fullName: "Lê Hoàng Long",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 65,
    members: [
      {
        id: "user-dev-001",
        username: "hoanglong.dev",
        fullName: "Lê Hoàng Long",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-02-15T10:00:00Z",
      },
      {
        id: "user-lead-002",
        username: "minhtuan.lead",
        fullName: "Trần Minh Tuấn",
        avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        role: "ADMIN",
        joinedAt: "2026-02-15T10:15:00Z",
      },
      {
        id: "user-ds-003",
        username: "thuha.ds",
        fullName: "Phạm Thu Hà",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-02-16T11:00:00Z",
      },
    ],
    messageCount: 3410,
    lastActiveAt: "2026-10-18T15:15:00Z",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "room-grp-003",
    title: "CLB Âm Nhạc & Nghệ Thuật Connexa",
    type: "GROUP",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
    creator: {
      id: "user-ds-003",
      username: "thuha.ds",
      fullName: "Phạm Thu Hà",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 42,
    members: [
      {
        id: "user-ds-003",
        username: "thuha.ds",
        fullName: "Phạm Thu Hà",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-03-01T14:00:00Z",
      },
      {
        id: "user-ui-004",
        username: "hoangmy.design",
        fullName: "Vũ Hoàng My",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-03-05T09:20:00Z",
      },
    ],
    messageCount: 1890,
    lastActiveAt: "2026-10-18T11:45:00Z",
    createdAt: "2026-03-01T14:00:00Z",
  },
  {
    id: "room-grp-004",
    title: "Nhóm Đồ Án Tốt Nghiệp 2026 (Team Connexa)",
    type: "GROUP",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80",
    creator: {
      id: "user-lead-002",
      username: "minhtuan.lead",
      fullName: "Trần Minh Tuấn",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 5,
    members: [
      {
        id: "user-lead-002",
        username: "minhtuan.lead",
        fullName: "Trần Minh Tuấn",
        avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-04-10T08:00:00Z",
      },
      {
        id: "user-dev-001",
        username: "hoanglong.dev",
        fullName: "Lê Hoàng Long",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "ADMIN",
        joinedAt: "2026-04-10T08:05:00Z",
      },
      {
        id: "user-ds-003",
        username: "thuha.ds",
        fullName: "Phạm Thu Hà",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-04-10T08:10:00Z",
      },
    ],
    messageCount: 5640,
    lastActiveAt: "2026-10-18T15:20:00Z",
    createdAt: "2026-04-10T08:00:00Z",
  },
  {
    id: "room-grp-005",
    title: "Hội Cựu Sinh Viên K60-K63",
    type: "GROUP",
    status: "CLOSED",
    avatarUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=120&auto=format&fit=crop&q=80",
    creator: {
      id: "user-qa-005",
      username: "duchung.qa",
      fullName: "Nguyễn Đức Hùng",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 88,
    members: [
      {
        id: "user-qa-005",
        username: "duchung.qa",
        fullName: "Nguyễn Đức Hùng",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-01-15T09:00:00Z",
      },
    ],
    messageCount: 1420,
    lastActiveAt: "2026-10-05T16:00:00Z",
    createdAt: "2026-01-15T09:00:00Z",
    closedReasonCategory: "Theo yêu cầu của quản trị nhóm",
    closedReasonDetails: "Chuyển sinh hoạt nhóm sang cổng cựu sinh viên chính thức của Nhà trường.",
    closedAt: "2026-10-06T10:00:00Z",
    closedBy: "Admin Quản trị",
  },
  {
    id: "room-dir-006",
    title: "Lê Hoàng Long & Trần Minh Tuấn",
    type: "DIRECT",
    status: "ACTIVE",
    avatarUrl: null,
    creator: {
      id: "user-dev-001",
      username: "hoanglong.dev",
      fullName: "Lê Hoàng Long",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 2,
    members: [
      {
        id: "user-dev-001",
        username: "hoanglong.dev",
        fullName: "Lê Hoàng Long",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-03-12T08:30:00Z",
      },
      {
        id: "user-lead-002",
        username: "minhtuan.lead",
        fullName: "Trần Minh Tuấn",
        avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-03-12T08:30:00Z",
      },
    ],
    messageCount: 842,
    lastActiveAt: "2026-10-18T13:40:00Z",
    createdAt: "2026-03-12T08:30:00Z",
  },
  {
    id: "room-dir-007",
    title: "Phạm Thu Hà & Nguyễn Đức Hùng",
    type: "DIRECT",
    status: "ACTIVE",
    avatarUrl: null,
    creator: {
      id: "user-ds-003",
      username: "thuha.ds",
      fullName: "Phạm Thu Hà",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 2,
    members: [
      {
        id: "user-ds-003",
        username: "thuha.ds",
        fullName: "Phạm Thu Hà",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-05-18T14:10:00Z",
      },
      {
        id: "user-qa-005",
        username: "duchung.qa",
        fullName: "Nguyễn Đức Hùng",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-05-18T14:10:00Z",
      },
    ],
    messageCount: 315,
    lastActiveAt: "2026-10-17T18:25:00Z",
    createdAt: "2026-05-18T14:10:00Z",
  },
  {
    id: "room-dir-008",
    title: "Vũ Hoàng My & Đặng Văn Khang",
    type: "DIRECT",
    status: "CLOSED",
    avatarUrl: null,
    creator: {
      id: "user-ui-004",
      username: "hoangmy.design",
      fullName: "Vũ Hoàng My",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
    memberCount: 2,
    members: [
      {
        id: "user-ui-004",
        username: "hoangmy.design",
        fullName: "Vũ Hoàng My",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        role: "OWNER",
        joinedAt: "2026-06-01T09:00:00Z",
      },
      {
        id: "user-bad-008",
        username: "vankhang.spam",
        fullName: "Đặng Văn Khang",
        avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        role: "MEMBER",
        joinedAt: "2026-06-01T09:00:00Z",
      },
    ],
    messageCount: 68,
    lastActiveAt: "2026-10-12T11:20:00Z",
    createdAt: "2026-06-01T09:00:00Z",
    closedReasonCategory: "Vi phạm Tiêu chuẩn Cộng đồng",
    closedReasonDetails: "Phát hiện phát tán liên kết độc hại, mạo danh chiếm đoạt tài khoản.",
    closedAt: "2026-10-13T09:00:00Z",
    closedBy: "Admin Quản trị",
  },
];

let mockRoomsState: AdminRoom[] = [...INITIAL_MOCK_ROOMS];

export const getMockRooms = (params: RoomFilterParams): RoomListResponse => {
  const { search, type, status, page, pageSize } = params;

  let filtered = [...mockRoomsState];

  // 1. Lọc theo Type (GROUP / DIRECT)
  if (type !== 'ALL') {
    filtered = filtered.filter((r) => r.type === type);
  }

  // 2. Lọc theo Status (ACTIVE / CLOSED)
  if (status !== 'ALL') {
    filtered = filtered.filter((r) => r.status === status);
  }

  // 3. Tìm kiếm theo Tên phòng hoặc Tên người tạo
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.creator.fullName.toLowerCase().includes(q) ||
        r.creator.username.toLowerCase().includes(q)
    );
  }

  // Thống kê tổng quan
  const stats = {
    totalRooms: mockRoomsState.length,
    groupRooms: mockRoomsState.filter((r) => r.type === 'GROUP').length,
    directRooms: mockRoomsState.filter((r) => r.type === 'DIRECT').length,
    totalMessages: mockRoomsState.reduce((sum, r) => sum + r.messageCount, 0),
  };

  // Phân trang
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    rooms: paginated,
    total,
    page,
    totalPages,
    stats,
  };
};

export const closeMockRoom = (
  roomId: string,
  payload: CloseRoomPayload,
  adminName: string = "Admin Quản trị"
): boolean => {
  const room = mockRoomsState.find((r) => r.id === roomId);
  if (!room) return false;
  if (room.isProtected) return false;

  room.status = 'CLOSED';
  room.closedReasonCategory = payload.reasonCategory;
  room.closedReasonDetails = payload.reasonDetails;
  room.closedAt = new Date().toISOString();
  room.closedBy = adminName;
  return true;
};

export const reopenMockRoom = (roomId: string): boolean => {
  const room = mockRoomsState.find((r) => r.id === roomId);
  if (!room) return false;

  room.status = 'ACTIVE';
  room.closedReasonCategory = undefined;
  room.closedReasonDetails = undefined;
  room.closedAt = undefined;
  room.closedBy = undefined;
  return true;
};
