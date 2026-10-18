export interface KpiMetrics {
  totalUsers: number;
  totalRooms: number;
  totalMessagesToday: number;
  totalPosts: number;
  totalInteractions: number;
  pendingReports: number;
  usersGrowthText?: string;
  postsGrowthText?: string;
}

export interface ActivityDataPoint {
  date: string;
  messages: number;
  posts: number;
  interactions: number;
}

export interface ContentDistributionItem {
  id: string;
  label: string;
  percentage: number;
  count: number;
  color: string;
}

export interface RecentReportItem {
  id: string;
  reporterName: string;
  reporterAvatar?: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetSummary: string;
  reason: string;
  createdAt: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface AiMonitorData {
  isBotEnabled: boolean;
  botTokensUsed: number;
  latencyMs: number;
  isLiveConnected: boolean;
}

export interface DashboardData {
  stats: KpiMetrics;
  chartData: ActivityDataPoint[];
  contentDistribution: ContentDistributionItem[];
  recentReports: RecentReportItem[];
  aiMonitor: AiMonitorData;
  isMock: boolean;
  dataSourceText?: string;
}
