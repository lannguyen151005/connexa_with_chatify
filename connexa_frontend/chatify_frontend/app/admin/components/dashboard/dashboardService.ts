import api from '../../../utils/api';
import { DashboardData } from './types';
import { MOCK_DASHBOARD_DATA } from './mockData';

export const isDashboardMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_MOCK === 'true';
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  // 1. Nếu cờ Dev Mock được BẬT tường minh, dùng Mock Data
  if (isDashboardMockEnabled()) {
    // Giả lập độ trễ mạng nhẹ để tạo cảm giác mượt mà
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_DASHBOARD_DATA;
  }

  // 2. Chế độ Production / Live Backend: Gọi Quarkus Backend thật
  // Tuyệt đối không âm thầm nuốt lỗi và đổi sang dữ liệu giả nếu cờ mock không bật
  const res = await api.get('/api/admin/dashboard');
  const d = res.data || {};

  return {
    isMock: false,
    dataSourceText: "Dữ liệu thời gian thực từ Backend Quarkus",
    stats: {
      totalUsers: d.totalUsers ?? 0,
      totalRooms: d.totalRooms ?? 0,
      totalMessagesToday: d.totalMessagesToday ?? 0,
      totalPosts: d.totalPosts ?? 0,
      totalInteractions: d.totalInteractions ?? 0,
      pendingReports: d.pendingReports ?? 0,
      usersGrowthText: d.usersGrowthText || "Thời gian thực",
      postsGrowthText: d.postsGrowthText || "Thời gian thực",
    },
    chartData: Array.isArray(d.chartData) ? d.chartData : [],
    contentDistribution: Array.isArray(d.contentDistribution) ? d.contentDistribution : [],
    recentReports: Array.isArray(d.recentReports) ? d.recentReports : [],
    aiMonitor: {
      isBotEnabled: d.isBotEnabled ?? true,
      botTokensUsed: d.botTokensUsed ?? 0,
      latencyMs: d.latencyMs ?? 0,
      isLiveConnected: true,
    },
  };
};

export const toggleBotStateApi = async (newState: boolean): Promise<boolean> => {
  if (isDashboardMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return newState;
  }
  await api.post('/api/admin/bot/toggle', { enabled: newState });
  return newState;
};
