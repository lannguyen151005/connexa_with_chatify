"use client";

import { useCallback, useEffect, useState } from "react";
import api from "../../../utils/api";
import { DEFAULT_AVATAR, Friend, FriendApiResponse } from "../types/Friend";


export function useFriends(userId: string | null) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);


    const fetchFriends = useCallback(
        async (pageNumber = 0) => {
            if (!userId) {
                setError("Không tìm thấy thông tin người dùng.");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response = await api.get(
                    `/api/v1/friend-requests/${userId}`,
                    { params: { page: pageNumber, size: 10 } }
                );

                console.log("Friends API response:", response.data);
                console.log("User ID:", userId);
                const result: FriendApiResponse =
                    response.data?.data;

                if (!Array.isArray(result?.items)) {
                    throw new Error("Dữ liệu bạn bè không hợp lệ.");
                }

                const items = result.items.map((friend) => ({
                    ...friend,
                    username: friend.username || "Người dùng",
                    avatar_url: friend.avatar_url || DEFAULT_AVATAR,
                    _online: friend._online ?? false,
                }));

                items.sort(
                    (a, b) => Number(b._online) - Number(a._online)
                );

                setFriends(items);
                setPage(result.page ?? pageNumber);
                setTotalPages(result.total_pages ?? 0);
                setTotalElements(result.total_elements ?? 0);
            } catch (err: any) {
                console.error("Lỗi lấy danh sách bạn bè:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Không thể tải danh sách bạn bè."
                );
            } finally {
                setLoading(false);
            }
        },
        [userId]
    );

    useEffect(() => {
        if (userId) {
            void fetchFriends(0);
        }
    }, [userId, fetchFriends]);

    return {
        friends,
        loading,
        error,
        page,
        totalPages,
        totalElements,
        fetchFriends,
    };
}