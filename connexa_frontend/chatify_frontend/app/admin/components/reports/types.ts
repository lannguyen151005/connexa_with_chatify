export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export type ReportReason = 
  | 'SPAM'
  | 'SCAM'
  | 'HATE_SPEECH'
  | 'HARASSMENT'
  | 'ADULT_CONTENT'
  | 'IMPERSONATION'
  | 'OTHER';

export type ReportActionTaken = 
  | 'REMOVE_CONTENT'
  | 'WARN_USER'
  | 'DISMISSED'
  | 'NO_ACTION';

export interface ReportUserSummary {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface AdminReport {
  id: string;
  reporter: ReportUserSummary;
  targetType: ReportTargetType;
  targetId: string;
  targetSummary: string;
  targetAuthor?: ReportUserSummary;
  reason: ReportReason;
  reasonText: string;
  details?: string;
  createdAt: string;
  status: ReportStatus;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  actionTaken?: ReportActionTaken | null;
  resolutionNote?: string | null;
}

export interface PaginatedReportsResponse {
  items: AdminReport[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  pendingCount: number;
  isMock?: boolean;
}

export interface ReportFilterParams {
  page?: number;
  size?: number;
  status?: ReportStatus | 'ALL';
  targetType?: ReportTargetType | 'ALL';
  keyword?: string;
}

export interface ResolveReportPayload {
  action: 'REMOVE_CONTENT' | 'WARN_USER';
  note?: string;
}

export interface DismissReportPayload {
  note?: string;
}
