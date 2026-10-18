import { AdminPost, PaginatedPostsResponse, PostFilterParams } from './types';

export let MOCK_POSTS_DATABASE: AdminPost[] = [
  {
    id: "post-101",
    author: {
      id: "usr-01",
      username: "admin_he_thong",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
      role: "ADMIN",
    },
    content: "📢 THÔNG BÁO HỆ THỐNG: Mạng xã hội Connexa chính thức nâng cấp tính năng Phòng Chat và Kiểm duyệt nội dung tự động. Mọi thắc mắc xin liên hệ quản trị viên.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
    ],
    createdAt: "2026-10-18T08:30:00Z",
    visibility: "PUBLIC",
    moderationStatus: "ACTIVE",
    isPinned: true,
    metrics: {
      likes: 342,
      comments: 58,
      shares: 41,
      reportsCount: 0,
    },
  },
  {
    id: "post-102",
    author: {
      id: "usr-02",
      username: "thao_nguyen",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp",
      role: "USER",
    },
    content: "Cuối tuần cùng nhóm bạn đi cắm trại ở Ba Vì. Thời tiết mát mẻ dễ chịu vô cùng, mọi người đã lên kế hoạch gì cho ngày mai chưa?",
    media: [
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
      {
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
    ],
    createdAt: "2026-10-18T07:15:00Z",
    visibility: "PUBLIC",
    moderationStatus: "ACTIVE",
    isPinned: false,
    metrics: {
      likes: 128,
      comments: 24,
      shares: 3,
      reportsCount: 0,
    },
  },
  {
    id: "post-103",
    author: {
      id: "usr-03",
      username: "tai_khoan_spam",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp",
      role: "USER",
    },
    content: "💥 CƠ HỘI ĐẦU TƯ LỢI NHUẬN 300% MỖI NGÀY! Inbox ngay số Zalo 0988xxxxxx để nhận mã rút tiền miễn phí, số lượng có hạn anh em nhanh tay!",
    media: [],
    createdAt: "2026-10-18T06:40:00Z",
    visibility: "PUBLIC",
    moderationStatus: "FLAGGED",
    isPinned: false,
    metrics: {
      likes: 3,
      comments: 15,
      shares: 0,
      reportsCount: 6,
    },
  },
  {
    id: "post-104",
    author: {
      id: "usr-04",
      username: "hoang_minh_tech",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
      role: "USER",
    },
    content: "Review nhanh laptop mới sắm để làm đồ án tốt nghiệp: bàn phím gõ êm, màn hình 2K sắc nét, pin dùng tầm 7 tiếng. Anh em có cần bài chi tiết không?",
    media: [
      {
        url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
    ],
    createdAt: "2026-10-17T20:10:00Z",
    visibility: "FRIENDS_ONLY",
    moderationStatus: "ACTIVE",
    isPinned: false,
    metrics: {
      likes: 95,
      comments: 18,
      shares: 2,
      reportsCount: 0,
    },
  },
  {
    id: "post-105",
    author: {
      id: "usr-05",
      username: "nghi_van_lua_dao",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp",
      role: "USER",
    },
    content: "Thanh lý vé concert Blackpink giá sốc chỉ 500k/vé, chuyển khoản trước giữ chỗ ngay. Cam kết vé thật 100%.",
    media: [
      {
        url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
    ],
    createdAt: "2026-10-17T18:22:00Z",
    visibility: "PUBLIC",
    moderationStatus: "HIDDEN",
    isPinned: false,
    metrics: {
      likes: 2,
      comments: 9,
      shares: 0,
      reportsCount: 4,
    },
  },
  {
    id: "post-106",
    author: {
      id: "usr-06",
      username: "lan_anh_design",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp",
      role: "USER",
    },
    content: "Vừa hoàn thành bộ UI/UX mới cho ứng dụng mobile. Xin ý kiến góp ý của các bạn làm design về phối màu và font chữ nhé!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1581291518655-9523c932deb2?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
      },
    ],
    createdAt: "2026-10-17T15:05:00Z",
    visibility: "PUBLIC",
    moderationStatus: "ACTIVE",
    isPinned: false,
    metrics: {
      likes: 210,
      comments: 42,
      shares: 19,
      reportsCount: 0,
    },
  },
  {
    id: "post-107",
    author: {
      id: "usr-07",
      username: "quoc_tuan",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
      role: "USER",
    },
    content: "Bài học rút ra sau 6 tháng thực tập lập trình: Học hỏi từ đồng nghiệp, luôn viết unit test cẩn thận và đừng ngại hỏi khi bị tắc giải pháp.",
    media: [],
    createdAt: "2026-10-17T11:45:00Z",
    visibility: "PUBLIC",
    moderationStatus: "ACTIVE",
    isPinned: false,
    metrics: {
      likes: 180,
      comments: 31,
      shares: 12,
      reportsCount: 0,
    },
  },
  {
    id: "post-108",
    author: {
      id: "usr-08",
      username: "tai_khoan_gay_roi",
      avatarUrl: null,
      role: "USER",
    },
    content: "Nội dung chửi bới kích động, xúc phạm các thành viên trong nhóm học tập gây mất đoàn kết.",
    media: [],
    createdAt: "2026-10-17T09:12:00Z",
    visibility: "PUBLIC",
    moderationStatus: "FLAGGED",
    isPinned: false,
    metrics: {
      likes: 1,
      comments: 44,
      shares: 0,
      reportsCount: 8,
    },
  },
];

export function getMockPaginatedPosts(params: PostFilterParams): PaginatedPostsResponse {
  const page = params.page ?? 0;
  const size = params.size ?? 6;
  const keyword = (params.keyword || "").trim().toLowerCase();
  const status = params.status || "ALL";
  const pinnedOnly = params.pinnedOnly ?? false;

  // Lọc chỉ những bài viết chưa bị xóa mềm
  let filtered = MOCK_POSTS_DATABASE.filter((p) => !p.deletedAt);

  // Lọc theo từ khóa tìm kiếm (nội dung hoặc tên tác giả)
  if (keyword) {
    filtered = filtered.filter(
      (p) =>
        p.content.toLowerCase().includes(keyword) ||
        p.author.username.toLowerCase().includes(keyword)
    );
  }

  // Lọc theo trạng thái kiểm duyệt
  if (status !== "ALL") {
    filtered = filtered.filter((p) => p.moderationStatus === status);
  }

  // Lọc chỉ bài đã ghim
  if (pinnedOnly) {
    filtered = filtered.filter((p) => p.isPinned);
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

export function mockTogglePinPost(postId: string, isPinned: boolean): AdminPost | null {
  const target = MOCK_POSTS_DATABASE.find((p) => p.id === postId);
  if (target) {
    target.isPinned = isPinned;
    return { ...target };
  }
  return null;
}

export function mockUpdatePostModerationStatus(
  postId: string,
  status: 'ACTIVE' | 'HIDDEN' | 'FLAGGED'
): AdminPost | null {
  const target = MOCK_POSTS_DATABASE.find((p) => p.id === postId);
  if (target) {
    target.moderationStatus = status;
    return { ...target };
  }
  return null;
}

export function mockSoftDeletePost(postId: string): boolean {
  const target = MOCK_POSTS_DATABASE.find((p) => p.id === postId);
  if (target) {
    target.deletedAt = new Date().toISOString();
    target.moderationStatus = 'HIDDEN';
    target.isPinned = false;
    return true;
  }
  return false;
}
