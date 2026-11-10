
"use client";

import React, { useState } from "react";
import api from "@/app/utils/api";
import toast from "react-hot-toast";

import PostContent from "@/app/connexa/post-detail/components/PostContent";
import ReactionSummary from "@/app/connexa/post-detail/components/ReactionSummary";
import CommentSection from "@/app/connexa/post-detail/components/CommentSection";
import ReportModal from "@/app/connexa/components/ReportModal";
import type { UserReportTargetType } from "@/app/connexa/services/ReportService";

import type {
  PostInfo,
  PostComment,
  ReactionType,
  ReactionUser,
} from "@/app/connexa/post-detail/types/post";

import {
  createComment,
  deleteComment,
  reactToPost,
} from "@/app/connexa/post-detail/services/PostInteractionService";

interface FeedPost extends PostInfo {
  _liked?: boolean;
}

interface CurrentUser {
  id?: string;
  username?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
}

interface Props {
  posts: FeedPost[];
  currentUserId: string | null;
  currentUser?: CurrentUser | null;
  onSelectViewDetail: (id: string) => void;
}

interface PostInteractionState {
  reactions: ReactionUser[];
  comments: PostComment[];
  myReaction: ReactionType | null;
  totalReactions: number;
  reactionsLoaded: boolean;
  commentsLoaded: boolean;
  commentsOpen: boolean;
  loadingComments: boolean;
  reacting: boolean;
}

const createInitialState = (): PostInteractionState => ({
  reactions: [],
  comments: [],
  myReaction: null,
  totalReactions: 0,
  reactionsLoaded: false,
  commentsLoaded: false,
  commentsOpen: false,
  loadingComments: false,
  reacting: false,
});

export default function PostCard({
  posts,
  currentUserId,
  currentUser,
  onSelectViewDetail,
}: Props) {
  const [interactionMap, setInteractionMap] = useState<
    Record<string, PostInteractionState>
  >({});

  const [commentCounts, setCommentCounts] = useState<
    Record<string, number>
  >({});

  const [reportTarget, setReportTarget] = useState<{
    targetType: UserReportTargetType;
    targetId: string;
    previewText: string;
  } | null>(null);

  const getState = (postId: string) =>
    interactionMap[postId] ?? createInitialState();

  const updatePostState = (
    postId: string,
    updater: (previous: PostInteractionState) => PostInteractionState
  ) => {
    setInteractionMap((previous) => ({
      ...previous,
      [postId]: updater(
        previous[postId] ?? createInitialState()
      ),
    }));
  };

  // =====================================
  // LOAD REACTIONS
  // =====================================

  const loadReactions = async (
    postId: string,
    force = false
  ) => {
    const current = getState(postId);

    if (current.reactionsLoaded && !force) {
      return current.reactions;
    }

    const response = await api.get(
      `/api/v1/posts/${postId}/reactions`,
      {
        params: { page: 0, size: 100 },
      }
    );

    const data = response.data.data;
    const reactions: ReactionUser[] = data.items ?? [];

    const mine = reactions.find(
      (item) => item.authorId === currentUserId
    );

    updatePostState(postId, (previous) => ({
      ...previous,
      reactions,
      totalReactions: data.total_elements ?? reactions.length,
      myReaction: mine?.type ?? null,
      reactionsLoaded: true,
    }));

    return reactions;
  };

  // =====================================
  // LOAD COMMENTS
  // =====================================

  const loadComments = async (
    postId: string,
    force = false
  ) => {
    const current = getState(postId);

    if (
      (current.commentsLoaded && !force) ||
      current.loadingComments
    ) {
      return;
    }

    updatePostState(postId, (previous) => ({
      ...previous,
      loadingComments: true,
    }));

    try {
      const response = await api.get(
        `/api/v1/posts/${postId}/comments`,
        {
          params: { page: 0, size: 100 },
        }
      );

      const data = response.data.data;
      const comments: PostComment[] = data.items ?? [];

      updatePostState(postId, (previous) => ({
        ...previous,
        comments,
        commentsLoaded: true,
      }));
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
      toast.error("Không thể tải bình luận.");
    } finally {
      updatePostState(postId, (previous) => ({
        ...previous,
        loadingComments: false,
      }));
    }
  };

  // =====================================
  // TOGGLE COMMENTS
  // =====================================

  const handleToggleComments = async (postId: string) => {
    const current = getState(postId);
    const nextOpen = !current.commentsOpen;

    updatePostState(postId, (previous) => ({
      ...previous,
      commentsOpen: nextOpen,
    }));

    if (nextOpen && !current.commentsLoaded) {
      await loadComments(postId);
    }
  };

  // =====================================
  // POST REACTION
  // =====================================

  const handlePostReaction = async (
    postId: string,
    nextType: ReactionType | null
  ) => {
    const current = getState(postId);

    if (current.reacting) return;

    updatePostState(postId, (previous) => ({
      ...previous,
      reacting: true,
    }));

    try {
      let reactions = current.reactions;

      if (!current.reactionsLoaded) {
        const response = await api.get(
          `/api/v1/posts/${postId}/reactions`,
          {
            params: { page: 0, size: 100 },
          }
        );

        const data = response.data.data;
        reactions = data.items ?? [];

        const mine = reactions.find(
          (item: ReactionUser) =>
            item.authorId === currentUserId
        );

        updatePostState(postId, (previous) => ({
          ...previous,
          reactions,
          totalReactions: data.total_elements ?? reactions.length,
          myReaction: mine?.type ?? null,
          reactionsLoaded: true,
        }));
      }

      const mine = reactions.find(
        (item) => item.authorId === currentUserId
      );

      const currentType = mine?.type ?? null;
      const typeToSend = nextType ?? currentType;

      if (!typeToSend) return;

      await reactToPost(postId, typeToSend);

      await loadReactions(postId, true);

      toast.success("Đã cập nhật cảm xúc!");
    } catch (error) {
      console.error("Lỗi reaction:", error);
      toast.error("Không thể cập nhật cảm xúc.");
    } finally {
      updatePostState(postId, (previous) => ({
        ...previous,
        reacting: false,
      }));
    }
  };

  // =====================================
  // ADD COMMENT / REPLY
  // =====================================

  const handleAddComment = async (
    postId: string,
    content: string,
    parentId: string | null
  ) => {
    try {
      const newComment = await createComment(
        postId,
        content,
        parentId
      );

      updatePostState(postId, (previous) => ({
        ...previous,
        comments: [
          ...previous.comments,
          newComment,
        ],
      }));

      setCommentCounts((previous) => ({
        ...previous,
        [postId]:
          (previous[postId] ??
            posts.find((p) => p.id === postId)?.comment_count ?? 0) + 1,
      }));

      window.dispatchEvent(
        new CustomEvent("connexa:comment-created", {
          detail: { postId },
        })
      );

      toast.success(
        parentId
          ? "Đã gửi phản hồi!"
          : "Đã gửi bình luận!"
      );
    } catch (error) {
      console.error("Lỗi tạo bình luận:", error);
      toast.error("Không thể gửi bình luận.");
      throw error;
    }
  };

  // =====================================
  // DELETE COMMENT + CHILD COMMENTS
  // =====================================

  const handleDeleteComment = async (
    postId: string,
    commentId: string
  ) => {
    try {
      const comments = getState(postId).comments;

      const idsToDelete = new Set<string>([commentId]);

      let changed = true;

      while (changed) {
        changed = false;

        comments.forEach((comment) => {
          if (
            comment.parentId &&
            idsToDelete.has(comment.parentId) &&
            !idsToDelete.has(comment.id)
          ) {
            idsToDelete.add(comment.id);
            changed = true;
          }
        });
      }

      await deleteComment(commentId);

      updatePostState(postId, (previous) => ({
        ...previous,
        comments: previous.comments.filter(
          (comment) => !idsToDelete.has(comment.id)
        ),
      }));

      setCommentCounts((previous) => {
        const oldCount =
          previous[postId] ??
          posts.find((p) => p.id === postId)?.comment_count ??
          0;

        return {
          ...previous,
          [postId]: Math.max(
            0,
            oldCount - idsToDelete.size
          ),
        };
      });

      toast.success("Đã xóa bình luận!");
    } catch (error) {
      console.error("Lỗi xóa bình luận:", error);
      toast.error("Không thể xóa bình luận.");
    }
  };

  // =====================================
  // COMMENT REACTION
  // =====================================

  const handleCommentReaction = (
    postId: string,
    commentId: string,
    nextType: ReactionType | null
  ) => {
    // Hiện backend chưa có API reaction comment.
    // Đây chỉ là cập nhật giao diện tạm thời.
    updatePostState(postId, (previous) => ({
      ...previous,
      comments: previous.comments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const oldType = comment.myReaction ?? null;
        const oldCount = comment.reactionCount ?? 0;

        const nextCount =
          !oldType && nextType
            ? oldCount + 1
            : oldType && !nextType
              ? Math.max(0, oldCount - 1)
              : oldCount;

        return {
          ...comment,
          myReaction: nextType,
          reactionCount: nextCount,
        };
      }),
    }));
  };

  // =====================================
  // USER
  // =====================================

  const userForComment = {
    id: currentUserId ?? "",
    username: currentUser?.username ?? "Bạn",
    avatarUrl:
      currentUser?.avatar_url ??
      currentUser?.avatarUrl ??
      null,
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-5">
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-gray-500">
            Chưa có bài viết nào.
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const state = getState(post.id);

          return (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {/* POST CONTENT */}

              <div
                onClick={(event) => {
                  const target = event.target as HTMLElement;

                  if (
                    target.closest("button") ||
                    target.closest("textarea") ||
                    target.closest("input")
                  ) {
                    return;
                  }

                  onSelectViewDetail(post.id);
                }}
                className="cursor-pointer"
              >
                <PostContent
                  post={post}
                  myReaction={state.myReaction}
                  reactionCount={
                    state.reactionsLoaded
                      ? state.totalReactions
                      : post.like_count ?? 0
                  }
                  onReact={(type) =>
                    handlePostReaction(post.id, type)
                  }
                  currentUserId={currentUserId}
                  onReportPost={(targetPost) =>
                    setReportTarget({
                      targetType: "POST",
                      targetId: targetPost.id,
                      previewText: targetPost.content,
                    })
                  }
                  onToggleComments={() =>
                    handleToggleComments(post.id)
                  }
                  commentCount={
                    commentCounts[post.id] ??
                    post.comment_count ??
                    0
                  }
                />
              </div>

              {/* REACTION SUMMARY */}

              {state.reactionsLoaded && (
                <div className="px-4 sm:px-6">
                  <ReactionSummary
                    reactions={state.reactions}
                  />
                </div>
              )}
              
              {/* COMMENT SECTION */}

              {state.commentsOpen && (
                <div className="px-4 pb-5 sm:px-6">
                  {state.loadingComments ? (
                    <div className="flex justify-center py-8">
                      <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    </div>
                  ) : (
                    <CommentSection
                      postId={post.id}
                      comments={state.comments}
                      currentUser={userForComment}
                      currentUserId={currentUserId}
                      postAuthorId={post.author?.id ?? ""}
                      onAddComment={(content, parentId) =>
                        handleAddComment(
                          post.id,
                          content,
                          parentId
                        )
                      }
                      onReactComment={(commentId, type) =>
                        handleCommentReaction(
                          post.id,
                          commentId,
                          type
                        )
                      }
                      onDeleteComment={(commentId) =>
                        handleDeleteComment(
                          post.id,
                          commentId
                        )
                      }
                      onReportComment={(comment) =>
                        setReportTarget({
                          targetType: "COMMENT",
                          targetId: comment.id,
                          previewText: comment.content,
                        })
                      }
                    />
                  )}
                </div>
              )}
            </article>
          );
        })
      )}

      {reportTarget && (
        <ReportModal
          isOpen={true}
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          previewText={reportTarget.previewText}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
