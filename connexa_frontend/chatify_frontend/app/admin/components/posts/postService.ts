import api from '../../../utils/api';
import { AdminPost, PaginatedPostsResponse, PostFilterParams, PostModerationStatus } from './types';
import {
  getMockPaginatedPosts,
  mockTogglePinPost,
  mockUpdatePostModerationStatus,
  mockSoftDeletePost,
} from './mockPosts';

export const isPostsMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_POSTS_MOCK === 'true';
};

export const fetchAdminPosts = async (
  params: PostFilterParams = {}
): Promise<PaginatedPostsResponse> => {
  // 1. Chế độ Mock Data dành cho Dev/UI
  if (isPostsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getMockPaginatedPosts(params);
  }

  // 2. Chế độ Production: Gọi Backend Quarkus thật
  const res = await api.get('/api/admin/posts', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });

  const rawData = res.data?.data || res.data || {};
  const rawItems: any[] = Array.isArray(rawData) ? rawData : (rawData.items || rawData.content || []);

  const items: AdminPost[] = rawItems.map((p: any) => ({
    id: p.id ? String(p.id) : '',
    author: {
      id: p.author?.id ? String(p.author.id) : '',
      username: p.author?.username || 'user',
      avatarUrl: p.author?.avatarUrl || p.author?.avatar_url || null,
      role: p.author?.role || 'USER',
    },
    content: p.content || '',
    media: Array.isArray(p.media_list || p.media)
      ? (p.media_list || p.media).map((m: any) => ({
          url: m.media_url || m.url || '',
          type: m.media_type || m.type || 'IMAGE',
          thumbnailUrl: m.thumbnail_url || m.thumbnailUrl,
        }))
      : [],
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    visibility: (p.privacy === 'FRIENDS_ONLY' ? 'FRIENDS_ONLY' : 'PUBLIC') as any,
    moderationStatus: p.moderationStatus || (p.is_deleted || p.isDeleted ? 'HIDDEN' : 'ACTIVE'),
    isPinned: Boolean(p.is_pinned ?? p.isPinned),
    metrics: {
      likes: p.like_count ?? p.likeCount ?? p.metrics?.likes ?? 0,
      comments: p.comment_count ?? p.commentCount ?? p.metrics?.comments ?? 0,
      shares: p.share_count ?? p.shareCount ?? p.metrics?.shares ?? 0,
      reportsCount: p.reports_count ?? p.reportsCount ?? p.metrics?.reportsCount ?? 0,
    },
  }));

  const totalElements = Number(rawData.total_elements ?? rawData.totalElements ?? items.length);
  const totalPages = Number(rawData.total_pages ?? rawData.totalPages ?? 1);

  return {
    items,
    totalElements,
    totalPages,
    page: Number(rawData.page ?? (params.page || 0)),
    size: Number(rawData.size ?? (params.size || 10)),
    isMock: false,
  };
};

export const togglePinPostApi = async (
  postId: string,
  isPinned: boolean
): Promise<AdminPost | null> => {
  if (isPostsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockTogglePinPost(postId, isPinned);
  }

  const res = await api.patch(`/api/admin/posts/${postId}/pin`, { isPinned });
  const raw = res.data?.data || res.data;
  if (!raw) return null;

  return {
    id: String(raw.id),
    author: {
      id: String(raw.author?.id || ''),
      username: raw.author?.username || 'user',
      avatarUrl: raw.author?.avatar_url || raw.author?.avatarUrl || null,
      role: raw.author?.role || 'USER',
    },
    content: raw.content || '',
    media: (raw.media_list || raw.media || []).map((m: any) => ({
      url: m.media_url || m.url || '',
      type: m.media_type || m.type || 'IMAGE',
      thumbnailUrl: m.thumbnail_url || m.thumbnailUrl,
    })),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    visibility: (raw.privacy === 'FRIENDS_ONLY' ? 'FRIENDS_ONLY' : 'PUBLIC') as any,
    moderationStatus: raw.is_deleted || raw.isDeleted ? 'HIDDEN' : 'ACTIVE',
    isPinned: Boolean(raw.is_pinned ?? raw.isPinned),
    metrics: {
      likes: raw.like_count ?? raw.likeCount ?? raw.metrics?.likes ?? 0,
      comments: raw.comment_count ?? raw.commentCount ?? raw.metrics?.comments ?? 0,
      shares: raw.share_count ?? raw.shareCount ?? raw.metrics?.shares ?? 0,
      reportsCount: raw.reports_count ?? raw.reportsCount ?? raw.metrics?.reportsCount ?? 0,
    },
  };
};

export const updatePostModerationStatusApi = async (
  postId: string,
  status: PostModerationStatus
): Promise<AdminPost | null> => {
  if (isPostsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockUpdatePostModerationStatus(postId, status);
  }

  const res = await api.patch(`/api/admin/posts/${postId}/status`, { status });
  return res.data;
};

export const softDeletePostApi = async (postId: string): Promise<boolean> => {
  if (isPostsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockSoftDeletePost(postId);
  }

  try {
    await api.delete(`/api/admin/posts/${postId}`);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      await api.delete(`/api/v1/posts/${postId}`);
    } else {
      throw err;
    }
  }
  return true;
};
