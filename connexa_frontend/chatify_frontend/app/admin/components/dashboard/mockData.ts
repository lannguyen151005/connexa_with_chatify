import { DashboardData } from './types';

export const MOCK_DASHBOARD_DATA: DashboardData = {
  isMock: true,
  dataSourceText: "Dữ liệu mẫu mô phỏng (Cờ NEXT_PUBLIC_ADMIN_DASHBOARD_MOCK=true)",
  stats: {
    totalUsers: 1280,
    totalRooms: 48,
    totalMessagesToday: 1520,
    totalPosts: 3450,
    totalInteractions: 18920,
    pendingReports: 3,
    usersGrowthText: "+12 thành viên hôm nay",
    postsGrowthText: "+8.4% tuần này",
  },
  chartData: [
    { date: "12/10", messages: 1120, posts: 320, interactions: 1840 },
    { date: "13/10", messages: 1350, posts: 410, interactions: 2450 },
    { date: "14/10", messages: 980, posts: 290, interactions: 1620 },
    { date: "15/10", messages: 1640, posts: 480, interactions: 2900 },
    { date: "16/10", messages: 1420, posts: 430, interactions: 2600 },
    { date: "17/10", messages: 1890, posts: 550, interactions: 3400 },
    { date: "Hôm nay", messages: 1520, posts: 470, interactions: 2910 },
  ],
  contentDistribution: [
    { id: "images", label: "Bài viết kèm hình ảnh", percentage: 58, count: 2001, color: "#2563eb" },
    { id: "text", label: "Bài viết thuần văn bản", percentage: 32, count: 1104, color: "#7c3aed" },
    { id: "links", label: "Chia sẻ liên kết & Đa phương tiện", percentage: 10, count: 345, color: "#ec4899" },
  ],
  recentReports: [
    {
      id: "rep-001",
      reporterName: "hoang_minh",
      reporterAvatar: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
      targetType: "POST",
      targetSummary: "Bài viết bán thực phẩm chức năng không rõ nguồn gốc...",
      reason: "Spam / Quảng cáo lừa đảo",
      createdAt: "10 phút trước",
      status: "PENDING",
    },
    {
      id: "rep-002",
      reporterName: "nguyen_lan",
      reporterAvatar: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp",
      targetType: "COMMENT",
      targetSummary: "Bình luận xúc phạm danh dự cá nhân trong bài đăng...",
      reason: "Ngôn từ thù địch / Quấy rối",
      createdAt: "35 phút trước",
      status: "PENDING",
    },
    {
      id: "rep-003",
      reporterName: "trung_kien",
      reporterAvatar: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp",
      targetType: "USER",
      targetSummary: "Tài khoản giả mạo hình ảnh người nổi tiếng để nhắn tin vay mượn",
      reason: "Giả mạo danh tính",
      createdAt: "2 giờ trước",
      status: "PENDING",
    },
  ],
  aiMonitor: {
    isBotEnabled: true,
    botTokensUsed: 24850,
    latencyMs: 48,
    isLiveConnected: false, // Rõ ràng là demo/chưa nối backend
  },
};
