
"use client";

import { useMemo, useState } from "react";
import type {
    PostComment,
    ReactionType,
} from "../types/post";
import CommentItem from "./CommentItem";

interface Props {
    postId: string;
    comments: PostComment[];
    currentUser: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    onAddComment: (
        content: string,
        parentId: string | null
    ) => Promise<void>;
    onReactComment: (
        commentId: string,
        type: ReactionType | null
    ) => void;
}

export default function CommentSection({
    postId,
    comments,
    currentUser,
    onAddComment,
    onReactComment,
}: Props) {
    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<PostComment | null>(
        null
    );
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const { roots, childrenByParent } = useMemo(() => {
        const byId = new Map(
            comments.map((comment) => [comment.id, comment])
        );

        const children = new Map<string, PostComment[]>();

        comments.forEach((comment) => {
            if (!comment.parentId) return;

            const siblings = children.get(comment.parentId) ?? [];
            siblings.push(comment);
            children.set(comment.parentId, siblings);
        });

        // Nếu thiếu bình luận cha trong dữ liệu phân trang,
        // tạm hiển thị comment đó như một nút gốc.
        const rootComments = comments.filter(
            (comment) =>
                !comment.parentId || !byId.has(comment.parentId)
        );

        return {
            roots: rootComments,
            childrenByParent: children,
        };
    }, [comments]);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        const trimmed = content.trim();

        if (!trimmed || submitting) return;

        setSubmitting(true);
        setSubmitError("");

        try {
            await onAddComment(
                trimmed,
                replyTo?.id ?? null
            );

            setContent("");
            setReplyTo(null);
        } catch (error) {
            setSubmitError(
                "Không thể gửi bình luận. Vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-gray-800">
                Bình luận ({comments.length})
            </h2>

            <form onSubmit={handleSubmit} className="mb-6">
                {replyTo && (
                    <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
                        <span className="min-w-0 truncate text-blue-700">
                            Đang trả lời{" "}
                            <strong>{replyTo.authorUsername}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="ml-2 shrink-0 font-semibold text-blue-700"
                        >
                            Hủy
                        </button>
                    </div>
                )}

                <div className="flex items-start gap-3">
                    <img
                        src={
                            currentUser.avatarUrl ||
                            "/default-avatar.png"
                        }
                        alt={currentUser.username}
                        className="h-10 w-10 shrink-0 rounded-full bg-gray-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder={
                                replyTo
                                    ? `Trả lời ${replyTo.authorUsername}...`
                                    : "Viết bình luận..."
                            }
                            rows={2}
                            maxLength={2000}
                            className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {submitError && (
                            <p className="mt-2 text-sm text-red-500">
                                {submitError}
                            </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-400">
                                {content.length}/2000
                            </span>

                            <button
                                type="submit"
                                disabled={!content.trim() || submitting}
                                className="rounded-lg bg-blue-600 px-4 py-2
                                text-sm font-semibold text-white
                                hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting
                                    ? "Đang gửi..."
                                    : replyTo
                                        ? "Gửi phản hồi"
                                        : "Bình luận"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {comments.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                    Chưa có bình luận nào. Hãy là người bình luận đầu tiên!
                </p>
            ) : (
                <div className="space-y-5">
                    {roots.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={
                                childrenByParent.get(comment.id) ?? []
                            }
                            childrenByParent={childrenByParent}
                            onReply={(target) => {
                                setReplyTo(target);
                                setContent("");
                            }}
                            onReact={onReactComment}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
