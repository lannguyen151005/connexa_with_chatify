
"use client";

import type {
  PostComment,
  ReactionType,
} from "../types/post";
import ReactionPicker from "./ReactionPicker";

interface Props {
  comment: PostComment;
  replies: PostComment[];
  childrenByParent: Map<string, PostComment[]>;
  onReply: (comment: PostComment) => void;
  onReact: (
    commentId: string,
    type: ReactionType | null
  ) => void;
}

export default function CommentItem({
  comment,
  replies,
  childrenByParent,
  onReply,
  onReact,
}: Props) {
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-2.5">
        <img
          src={
            comment.authorAvatarUrl ||
            "/default-avatar.png"
          }
          alt={comment.authorUsername}
          className="h-9 w-9 shrink-0 rounded-full bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3.5 py-2.5">
            <p className="text-sm font-bold text-gray-800">
              {comment.authorUsername || "Người dùng"}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
              {comment.content}
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 px-2">
            <span className="text-xs text-gray-400">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleString("vi-VN")
                : ""}
            </span>

            <button
              type="button"
              onClick={() => onReply(comment)}
              className="text-xs font-semibold text-gray-500 hover:text-blue-600"
            >
              Trả lời
            </button>

            <ReactionPicker
              compact
              value={comment.myReaction ?? null}
              onChange={(type) => onReact(comment.id, type)}
            />

            <span className="text-xs text-gray-400">
              {comment.reactionCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-4 mt-3 space-y-4 border-l-2 border-orange-100 pl-3 sm:ml-8 sm:pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={childrenByParent.get(reply.id) ?? []}
              childrenByParent={childrenByParent}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
