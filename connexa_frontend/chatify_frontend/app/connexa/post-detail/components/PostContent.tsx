
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
}

export default function PostContent({
  post,
  myReaction,
  reactionCount,
  onReact,
}: Props) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <img
          src={
            post.author?.avatar_url ||
            "/default-avatar.png"
          }
          alt={post.author?.username || "Người dùng"}
          className="h-11 w-11 rounded-full bg-gray-100 object-cover"
        />

        <div className="min-w-0">
          <p className="font-bold text-orange-600">
            {post.author?.username || "Người dùng"}
          </p>
          <p className="text-xs text-gray-400">
            {post.created_at
              ? new Date(post.created_at).toLocaleString("vi-VN")
              : ""}
          </p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-left leading-relaxed text-gray-700">
        {post.content}
      </p>

      {!!post.media_list?.length && (
        <div
          className="mt-4 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              post.media_list.length,
              3
            )}, minmax(0, 1fr))`,
          }}
        >
          {post.media_list.map((media) => (
            <div
              key={media.id}
              className="overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={media.media_url}
                alt="Ảnh bài viết"
                className="max-h-[450px] min-h-32 w-full object-cover"
              />
            </div>
          ))}
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

      <div className="mt-2 flex items-center border-t border-gray-100 pt-2">
        <ReactionPicker
          value={myReaction}
          onChange={onReact}
        />
      </div>
    </article>
  );
}
