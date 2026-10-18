import api from '../../../utils/api';
import { CloseRoomPayload, RoomFilterParams, RoomListResponse } from './types';
import { closeMockRoom, getMockRooms, reopenMockRoom } from './mockRooms';

export const isRoomMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_ROOMS_MOCK === 'true';
};

export const fetchRooms = async (params: RoomFilterParams): Promise<RoomListResponse> => {
  // 1. Chế độ Mock cho môi trường phát triển UI
  if (isRoomMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getMockRooms(params);
  }

  // 2. Chế độ Production / Live Backend Quarkus
  // Không bao giờ âm thầm tráo sang mock nếu API thật bị lỗi
  const res = await api.get('/api/admin/rooms/list', {
    params: {
      search: params.search || undefined,
      type: params.type !== 'ALL' ? params.type : undefined,
      status: params.status !== 'ALL' ? params.status : undefined,
      page: params.page,
      pageSize: params.pageSize,
    },
  });

  const data = res.data;

  // Nếu backend trả về mảng danh sách trực tiếp (legacy format)
  if (Array.isArray(data)) {
    const total = data.length;
    return {
      rooms: data.map((r: any) => ({
        id: r.id || String(r._id),
        title: r.title || r.name || "Phòng trò chuyện",
        type: r.type || (r.is_group ? "GROUP" : "DIRECT"),
        status: r.status || "ACTIVE",
        avatarUrl: r.avatar_url || null,
        creator: {
          id: r.creator_id || "unknown",
          username: r.creator_username || "user",
          fullName: r.creator_name || "Thành viên",
          avatarUrl: r.creator_avatar || null,
        },
        memberCount: r.member_count || (r.members ? r.members.length : 2),
        members: Array.isArray(r.members)
          ? r.members.map((m: any) => ({
              id: m.id || m.user_id,
              username: m.username || "user",
              fullName: m.full_name || m.name || "Thành viên",
              avatarUrl: m.avatar_url || null,
              role: m.role || "MEMBER",
              joinedAt: m.joined_at || new Date().toISOString(),
            }))
          : [],
        messageCount: r.message_count || 0,
        lastActiveAt: r.last_active_at || r.updated_at || r.created_at || new Date().toISOString(),
        createdAt: r.created_at || new Date().toISOString(),
        isProtected: Boolean(r.is_protected),
      })),
      total,
      page: params.page,
      totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
      stats: {
        totalRooms: total,
        groupRooms: data.filter((r: any) => r.type === "GROUP" || r.is_group).length,
        directRooms: data.filter((r: any) => r.type === "DIRECT" || !r.is_group).length,
        totalMessages: data.reduce((acc: number, r: any) => acc + (r.message_count || 0), 0),
      },
    };
  }

  return {
    rooms: data.rooms || [],
    total: data.total || 0,
    page: data.page || params.page,
    totalPages: data.totalPages || 1,
    stats: data.stats || {
      totalRooms: data.total || 0,
      groupRooms: 0,
      directRooms: 0,
      totalMessages: 0,
    },
  };
};

export const closeRoomApi = async (roomId: string, payload: CloseRoomPayload): Promise<boolean> => {
  if (isRoomMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return closeMockRoom(roomId, payload);
  }

  // Gọi API Backend thật: Ưu tiên PATCH close, fallback DELETE nếu backend cũ
  try {
    await api.patch(`/api/admin/rooms/${roomId}/close`, payload);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      await api.delete(`/api/admin/rooms/${roomId}`, { data: payload });
    } else {
      throw err;
    }
  }
  return true;
};

export const reopenRoomApi = async (roomId: string): Promise<boolean> => {
  if (isRoomMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return reopenMockRoom(roomId);
  }

  await api.patch(`/api/admin/rooms/${roomId}/reopen`);
  return true;
};
