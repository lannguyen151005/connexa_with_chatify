export type PostModerationStatus = 'ACTIVE' | 'HIDDEN' | 'FLAGGED';

export type PostVisibility = 'PUBLIC' | 'FRIENDS_ONLY';

export interface PostMediaItem {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string;
}

export interface PostAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: string;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  reportsCount: number;
}

export interface AdminPost {
  id: string;
  author: PostAuthor;
  content: string;
  media: PostMediaItem[];
  createdAt: string;
  visibility: PostVisibility;
  moderationStatus: PostModerationStatus;
  isPinned: boolean;
  metrics: PostMetrics;
  deletedAt?: string | null;
}

export interface PaginatedPostsResponse {
  items: AdminPost[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  isMock?: boolean;
}

export interface PostFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: PostModerationStatus | 'ALL';
  pinnedOnly?: boolean;
}
