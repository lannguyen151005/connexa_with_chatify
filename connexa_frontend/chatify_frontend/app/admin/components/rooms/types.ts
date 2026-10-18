export type RoomType = 'GROUP' | 'DIRECT';
export type RoomStatus = 'ACTIVE' | 'CLOSED';

export interface RoomMember {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface AdminRoom {
  id: string;
  title: string;
  type: RoomType;
  status: RoomStatus;
  avatarUrl: string | null;
  creator: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  memberCount: number;
  members: RoomMember[];
  messageCount: number;
  lastActiveAt: string;
  createdAt: string;
  isProtected?: boolean; // Phòng hệ thống không thể xóa/đóng
  closedReasonCategory?: string;
  closedReasonDetails?: string;
  closedAt?: string;
  closedBy?: string;
}

export interface RoomFilterParams {
  search: string;
  type: 'ALL' | RoomType;
  status: 'ALL' | RoomStatus;
  page: number;
  pageSize: number;
}

export interface CloseRoomPayload {
  reasonCategory: string;
  reasonDetails: string;
}

export interface RoomListResponse {
  rooms: AdminRoom[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    totalRooms: number;
    groupRooms: number;
    directRooms: number;
    totalMessages: number;
  };
}
