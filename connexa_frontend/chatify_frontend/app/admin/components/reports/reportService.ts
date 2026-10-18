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

  const data = res.data;
  return {
    items: data.items || data.content || [],
    totalElements: data.totalElements ?? (data.items ? data.items.length : 0),
    totalPages: data.totalPages ?? 1,
    page: data.page ?? (params.page || 0),
    size: data.size ?? (params.size || 6),
    pendingCount: data.pendingCount ?? 0,
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

  const res = await api.post(`/api/admin/reports/${reportId}/resolve`, payload);
  return res.data;
};

export const dismissReportApi = async (
  reportId: string,
  payload: DismissReportPayload = {}
): Promise<AdminReport | null> => {
  if (isReportsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockDismissReport(reportId, payload);
  }

  const res = await api.post(`/api/admin/reports/${reportId}/dismiss`, payload);
  return res.data;
};
