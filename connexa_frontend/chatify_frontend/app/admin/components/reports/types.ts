export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export type ReportSource = 'USER' | 'AI_MODERATION';

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
  | 'LOCK_USER'
  | 'WARN_USER'
  | 'DISMISSED'
  | 'NO_ACTION';

export interface ReportUserSummary {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ReportMediaItem {
  id?: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | string;
  display_order?: number;
}

export interface AdminReport {
  id: string;
  reporter: ReportUserSummary | null;
  source: ReportSource;
  aiConfidence?: number | null;
  targetType: ReportTargetType;
  targetId: string;
  targetSummary: string;
  targetMedia?: ReportMediaItem[];
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
  source?: ReportSource | 'ALL';
  keyword?: string;
}

export interface ResolveReportPayload {
  action: 'REMOVE_CONTENT' | 'WARN_USER' | 'LOCK_USER';
  note?: string;
}

export interface DismissReportPayload {
  note?: string;
}
