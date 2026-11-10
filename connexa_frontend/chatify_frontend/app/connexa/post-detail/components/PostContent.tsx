
"use client";

import type {
  PostInfo,
  ReactionType,
} from "../types/post";
import ReactionPicker from "./ReactionPicker";

interface Props {
  post: PostInfo;
  myReaction: ReactionType | null;
  reactionCount: number;
  onReact: (type: ReactionType | null) => void;
  currentUserId?: string | null;
  onReportPost?: (post: PostInfo) => void;
  onToggleComments?: () => void;
  commentCount?: number;
}

export default function PostContent({
  post,
  myReaction,
  reactionCount,
  onReact,
  currentUserId,
  onReportPost,
  onToggleComments,
  commentCount
}: Props) {
  const canReport =
    !!onReportPost &&
    !!currentUserId &&
    !!post.author?.id &&
    currentUserId !== post.author.id;
  const displayCommentCount = commentCount ?? post.comment_count ?? 0;

  return (

    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              post.author?.avatar_url ||
              "/default-avatar.png"
            }
            alt={post.author?.username || "Người dùng"}
            className="h-11 w-11 rounded-full bg-gray-100 object-cover shrink-0"
          />

          <div className="min-w-0 flex-col flex gap-1 overflow-hidden text-left">
            <span className="font-bold text-gray-500 truncate">
              {post.author?.username || "Người dùng"}
            </span>
            <span className="text-xs text-gray-400">
              {post.created_at
                ? new Date(post.created_at).toLocaleString("vi-VN")
                : ""}
            </span>
          </div>
        </div>

        {canReport && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReportPost(post);
            }}
            title="Báo cáo bài viết vi phạm"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-semibold text-gray-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <i className="fas fa-flag text-[11px]" />
            <span className="hidden sm:inline">Báo cáo</span>
          </button>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-left leading-relaxed text-gray-700">
        {post.content}
      </p>

      
{!!post.media_list?.length && (
  <div
    className={`mt-4 grid gap-2 ${
      post.media_list.length === 1
        ? "grid-cols-1"
        : "grid-cols-2"
    }`}
  >
    {post.media_list.map((media) => {
      const mediaType = media.media_type?.toUpperCase();

      return (
        <div
          key={media.id}
          className="overflow-hidden rounded-xl bg-gray-100"
        >
          {mediaType === "VIDEO" ? (
            <video
              src={media.media_url}
              controls
              playsInline
              preload="metadata"
              className="max-h-[500px] min-h-32 w-full rounded-xl bg-black object-contain"
            >
              Trình duyệt không hỗ trợ phát video.
            </video>
          ) : (
            <img
              src={media.media_url}
              alt="Ảnh bài viết"
              loading="lazy"
              className="max-h-[450px] min-h-32 w-full object-cover"
            />
          )}
        </div>
      );
    })}
  </div>
)}


      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-500">
          {reactionCount} cảm xúc
        </span>
        <span className="text-sm text-gray-500">
          {post.comment_count ?? 0} bình luận
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
        {/* NÚT THÍCH */}
        <div className="flex flex-1 justify-center">
          <ReactionPicker
            value={myReaction}
            onChange={onReact}
          />
        </div>

        {/* NÚT BÌNH LUẬN */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComments?.();
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-blue-600"
        >
          <i className="far fa-comment-alt" />
          <span>Bình luận ({displayCommentCount})</span>
        </button>
      </div>
    </article>
  );
}
