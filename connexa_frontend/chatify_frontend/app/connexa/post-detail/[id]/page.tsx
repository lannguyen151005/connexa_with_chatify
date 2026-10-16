'use client'
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/utils/api";
import PostContent from "../components/PostContent";
import ReactionSummary from "../components/ReactionSummary";
import CommentSection from "../components/CommentSection";
import { PostComment, PostInfo, ReactionType, ReactionUser } from "../types/post";
import toast from "react-hot-toast";
import { createComment, deleteComment, reactToPost } from "../services/PostInteractionService";
import { jwtDecode } from "jwt-decode";


export default function PostDetailPage() {

    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);

    const [currentUserId, setCurrentUserId] =
        useState<string | null>(null);

    const [postInfo, setPostInfo] =
        useState<PostInfo | null>(null);

    const [postReactions, setPostReactions] =
        useState<ReactionUser[]>([]);

    const [totalReactions, setTotalReactions] =
        useState(0);

    const [myPostReaction, setMyPostReaction] =
        useState<ReactionType | null>(null);

    const [postComments, setPostComments] =
        useState<PostComment[]>([]);
    const [authChecked, setAuthChecked] = useState(false);
    const postId = params.id;

    const [currentUser] = useState({
        id: "demo-current-user",
        username: "Bạn",
        avatarUrl: null as string | null,
    });

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        if (!token) {
            setAuthChecked(true);
            return;
        }
        try {
            const decoded: { sub: string } = jwtDecode(token);
            setCurrentUserId(decoded.sub);
            setAuthChecked(true);
        } catch (error) {
            console.error("Không thể đọc JWT:", error);

        }
    }, []);

    const [reacting, setReacting] = useState(false);

    const handlePostReaction = async (
        nextType: ReactionType | null
    ) => {
        if (reacting || !postId) return;

        // API toggle yêu cầu gửi loại cảm xúc đang chọn
        // để xóa, hoặc loại mới để thay đổi.
        const typeToSend = nextType ?? myPostReaction;

        if (!typeToSend) return;

        setReacting(true);

        try {
            await reactToPost(postId, typeToSend);

            // Backend trả data: null, nên tải lại danh sách
            // để lấy trạng thái và tổng số chính xác.
            const response = await api.get(
                `/api/v1/posts/${postId}/reactions`,
                { params: { page: 0, size: 20 } }
            );

            const data = response.data.data;
            const items: ReactionUser[] = data.items ?? [];

            setPostReactions(items);
            setTotalReactions(data.total_elements ?? 0);

            const mine = items.find(
                (reaction) => reaction.authorId === currentUserId
            );

            setMyPostReaction(mine?.type ?? null);

            toast.success("Đã cập nhật cảm xúc!");
        } catch (error) {
            console.error("Lỗi cập nhật cảm xúc:", error);
            toast.error("Không thể cập nhật cảm xúc.");
        } finally {
            setReacting(false);
        }
    };


    const handleAddComment = async (
        content: string,
        parentId: string | null
    ) => {
        try {
            const newComment = await createComment(
                postId,
                content,
                parentId
            );

            // Backend trả về comment đã tạo.
            // Thêm đúng ID thật vào danh sách.
            setPostComments((previous) => [
                ...previous,
                {
                    ...newComment,
                    myReaction: null,
                    reactionCount: 0,
                    reactions: [],
                },
            ]);

            setPostInfo((previous) =>
                previous
                    ? {
                        ...previous,
                        comment_count:
                            (previous.comment_count ?? 0) + 1,
                    }
                    : previous
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

    const handleCommentReaction = (
        commentId: string,
        nextType: ReactionType | null
    ) => {
        setPostComments((previous) =>
            previous.map((comment) => {
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
            })
        );
    };

    const handleDeleteComment = async (
        commentId: string
    ) => {
        try {
            await deleteComment(commentId);

            // Xóa bình luận cùng các phản hồi bên dưới.
            setPostComments((previous) => {
                const idsToDelete = new Set<string>([commentId]);

                let changed = true;

                while (changed) {
                    changed = false;

                    previous.forEach((comment) => {
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

                return previous.filter(
                    (comment) => !idsToDelete.has(comment.id)
                );
            });

            toast.success("Đã xóa bình luận!");
        } catch (error) {
            console.error("Lỗi xóa bình luận:", error);
            toast.error("Không thể xóa bình luận.");
        }
    };


    useEffect(() => {
        if (!postId || !authChecked) return;
        fetchPostDetail(postId);

    }, [postId, authChecked, currentUserId]);


    const fetchPostDetail = async (id: string) => {
        try {
            const [postInfoRes, postReactionRes, postCommentRes] =
                await Promise.all([
                    api.get(`/api/v1/posts/${id}`),
                    api.get(`/api/v1/posts/${id}/reactions`, {
                        params: { page: 0, size: 100 },
                    }),
                    api.get(`/api/v1/posts/${id}/comments`, {
                        params: { page: 0, size: 100 },
                    }),
                ]);

            const post = postInfoRes.data.data;
            const reactionData = postReactionRes.data.data;

            setPostInfo(post);

            setPostReactions(reactionData.items ?? []);

            setTotalReactions(
                reactionData.total_elements ?? 0
            );

            setPostComments(
                postCommentRes.data.data.items ?? []
            );

            // Tìm cảm xúc của người đang đăng nhập.
            const myReaction = currentUserId
                ? (reactionData.items ?? []).find(
                    (reaction: ReactionUser) =>
                        reaction.authorId === currentUserId
                )
                : undefined;

            setMyPostReaction(myReaction?.type ?? null);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
                <p className="text-sm sm:text-base text-gray-500 font-medium text-center">
                    Đang tải bài viết...
                </p>
            </div>
        );
    }

    if (!postInfo) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
                <p className="text-gray-500">
                    Không tìm thấy bài viết hoặc có lỗi xảy ra.
                </p>

                <button
                    onClick={() => router.back()}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-white"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#f4f6f8] text-gray-800">
            <Header />

            <main className="mx-auto box-border w-full min-w-0 max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
                <main className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-5 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
                    >
                        <i className="fas fa-arrow-left" />
                        Quay lại
                    </button>


                    {postInfo && (
                        <>
                            <PostContent
                                post={postInfo}
                                myReaction={myPostReaction}
                                reactionCount={totalReactions}
                                onReact={handlePostReaction}
                            />

                            <ReactionSummary reactions={postReactions} />

                            <CommentSection
                                postId={postId}
                                comments={postComments}
                                currentUser={currentUser}
                                onAddComment={handleAddComment}
                                onReactComment={handleCommentReaction}
                            />
                        </>
                    )}

                </main>
            </main>
        </div>
    );
}
