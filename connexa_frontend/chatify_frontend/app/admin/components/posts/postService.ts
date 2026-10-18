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
      keyword: params.keyword || undefined,
      status: params.status && params.status !== 'ALL' ? params.status : undefined,
      pinnedOnly: params.pinnedOnly || undefined,
    },
  });

  const data = res.data;
  return {
    items: data.items || data.content || [],
    totalElements: data.totalElements ?? (data.items ? data.items.length : 0),
    totalPages: data.totalPages ?? 1,
    page: data.page ?? (params.page || 0),
    size: data.size ?? (params.size || 10),
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
  return res.data;
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

  await api.delete(`/api/admin/posts/${postId}`);
  return true;
};
