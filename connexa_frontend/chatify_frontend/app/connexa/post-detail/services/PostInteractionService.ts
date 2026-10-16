
import api from "@/app/utils/api";
import type {
  PostComment,
  ReactionType,
} from "@/app/connexa/post-detail/types/post";

// Tạo bình luận hoặc trả lời bình luận
export async function createComment(
  postId: string,
  content: string,
  parentId: string | null
): Promise<PostComment> {
  const response = await api.post(
    `/api/v1/posts/${postId}/comments`,
    {
      content,
      parentId,
    }
  );

  return response.data.data as PostComment;
}

// Xóa bình luận
export async function deleteComment(
  commentId: string
): Promise<void> {
  await api.delete(
    `/api/v1/posts/comments/${commentId}`
  );
}

// Toggle cảm xúc bài viết
export async function reactToPost(
  postId: string,
  reactionType: ReactionType
): Promise<void> {
  await api.post(
    `/api/v1/posts/${postId}/reactions`,
    {
      type: reactionType,
    }
  );
}

// Chưa có API cảm xúc bình luận
export async function reactToComment(
  commentId: string,
  reactionType: ReactionType | null
): Promise<void> {
  throw new Error(
    "Chưa tích hợp API cảm xúc bình luận."
  );
}
