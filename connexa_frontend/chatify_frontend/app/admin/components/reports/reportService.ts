import api from '../../../utils/api';
import {
  AdminReport,
  DismissReportPayload,
  PaginatedReportsResponse,
  ReportFilterParams,
  ResolveReportPayload,
} from './types';
import {
  getMockPaginatedReports,
  mockDismissReport,
  mockResolveReport,
} from './mockReports';

export const isReportsMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_REPORTS_MOCK === 'true';
};

export const fetchAdminReports = async (
  params: ReportFilterParams = {}
): Promise<PaginatedReportsResponse> => {
  if (isReportsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getMockPaginatedReports(params);
  }

  const res = await api.get('/api/admin/reports', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 6,
      status: params.status && params.status !== 'ALL' ? params.status : undefined,
      targetType: params.targetType && params.targetType !== 'ALL' ? params.targetType : undefined,
      keyword: params.keyword || undefined,
    },
  });

  const rawData = res.data?.data || res.data || {};
  const rawItems: any[] = Array.isArray(rawData) ? rawData : (rawData.items || rawData.content || []);

  const items: AdminReport[] = rawItems.map((r: any) => ({
    id: String(r.id),
    reporter: {
      id: String(r.reporter?.id || ''),
      username: r.reporter?.username || 'user',
      avatarUrl: r.reporter?.avatarUrl || null,
    },
    targetType: r.targetType || 'POST',
    targetId: String(r.targetId || ''),
    targetSummary: r.targetPreview?.content || r.targetSummary || 'Nội dung bị báo cáo',
    targetAuthor: r.targetPreview?.author
      ? {
          id: String(r.targetPreview.author.id || ''),
          username: r.targetPreview.author.username || 'user',
          avatarUrl: r.targetPreview.author.avatarUrl || null,
        }
      : undefined,
    reason: (r.reason || 'OTHER') as any,
    reasonText: r.reason || 'Vi phạm tiêu chuẩn cộng đồng',
    details: r.details || undefined,
    createdAt: r.createdAt || new Date().toISOString(),
    status: r.status || 'PENDING',
    resolvedAt: r.resolvedAt || null,
    resolvedBy: r.resolvedBy
      ? (typeof r.resolvedBy === 'object' ? r.resolvedBy.username || 'Admin' : String(r.resolvedBy))
      : null,
    actionTaken: r.actionTaken || null,
    resolutionNote: r.resolutionNotes || r.resolutionNote || null,
  }));

  const totalElements = Number(rawData.total_elements ?? rawData.totalElements ?? items.length);
  const totalPages = Number(rawData.total_pages ?? rawData.totalPages ?? 1);

  return {
    items,
    totalElements,
    totalPages,
    page: Number(rawData.page ?? (params.page || 0)),
    size: Number(rawData.size ?? (params.size || 6)),
    pendingCount: items.filter((i) => i.status === 'PENDING').length,
    isMock: false,
  };
};

export const resolveReportApi = async (
  reportId: string,
  payload: ResolveReportPayload
): Promise<AdminReport | null> => {
  if (isReportsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockResolveReport(reportId, payload);
  }

  // Định dạng chuẩn theo ResolveReportRequestDTO của Quarkus Backend
  const backendBody = {
    actionTaken: payload.action,
    resolutionNotes: payload.note || '',
  };

  const res = await api.post(`/api/admin/reports/${reportId}/resolve`, backendBody);
  return res.data?.data || res.data;
};

export const dismissReportApi = async (
  reportId: string,
  payload: DismissReportPayload = {}
): Promise<AdminReport | null> => {
  if (isReportsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDismissReport(reportId, payload);
  }

  // Định dạng chuẩn theo DismissReportRequestDTO của Quarkus Backend
  const backendBody = {
    resolutionNotes: payload.note || '',
  };

  const res = await api.post(`/api/admin/reports/${reportId}/dismiss`, backendBody);
  return res.data?.data || res.data;
};
