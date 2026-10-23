
"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import api from "@/app/utils/api";
import Header from "@/app/connexa/components/Header";
import FriendListProfile from "@/app/connexa/components/FriendListProfile";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import PostCard from "../../components/PostCard";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  const [totalFriends, setTotalFriends] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const isMyProfile = !!currentUserId && currentUserId === userId;
  const relationship = userProfile?.requestStatus;

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const storedUserId = localStorage.getItem("user_id");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!storedUserId) {
      console.error("Không tìm thấy user_id trong localStorage");
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await api.get(
          `/api/users/profile/${storedUserId}`
        );

        setCurrentUser(res.data?.data);
        setCurrentUserId(storedUserId);
      } catch (error) {
        console.error(
          "Lỗi lấy thông tin người dùng hiện tại:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, [router]);

  // Lấy thông tin hồ sơ, bạn bè và bài viết
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchFriends(userId);
      fetchUserPosts(userId);
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get(`/api/users/profile/${userId}`);
      setUserProfile(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin trang cá nhân:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách bạn bè, chỉ hiển thị 5 người
  const fetchFriends = async (id: string) => {
    try {
      const res = await api.get(`/api/v1/friend-requests/${id}`, {
        params: {
          page: 0,
          size: 10,
        },
      });

      const data = res.data?.data;
      const items = data?.items ?? [];

      // Lấy tổng số bạn bè từ API nếu có
      setTotalFriends(
        data?.totalElements ??
        data?.totalItems ??
        data?.total ??
        items.length
      );

      const formattedData = items.map((item: any) => ({
        id: item.id,
        username: item.username || "Unknown User",
        avatar_url: item.avatar_url,
        isOnline: item._online,
      }));

      // Ưu tiên bạn bè đang online
      const sortedData = [...formattedData].sort((a, b) => {
        if (a.isOnline === true && b.isOnline !== true) return -1;
        if (a.isOnline !== true && b.isOnline === true) return 1;
        return 0;
      });

      // Chỉ hiển thị tối đa 5 người
      setFriends(sortedData.slice(0, 5));
    } catch (error) {
      console.error("Lỗi lấy danh sách bạn bè:", error);
      setFriends([]);
      setTotalFriends(0);
    }
  };

  // Xem danh sách bạn bè
  const handleViewAllFriends = () => {
    router.push(`/connexa/profile/${userId}/friends`);
  };

  // Gửi lời mời kết bạn
  const handleAddFriend = async () => {
    try {
      await api.post("/api/v1/friend-requests", {
        receiverId: userId,
      });

      toast.success("Đã gửi lời mời kết bạn!");

      setUserProfile((prev: any) => ({
        ...prev,
        requestStatus: "PENDING",
      }));
    } catch (error) {
      console.error("Lỗi gửi lời mời kết bạn:", error);
      toast.error("Không thể gửi lời mời kết bạn.");
    }
  };

  // Xóa bạn bè
  const handleRemoveFriend = async () => {
    const result = await Swal.fire({
      title: "Xác nhận xóa bạn bè",
      text: `Bạn có chắc chắn muốn XÓA BẠN BÈ với "${userProfile?.username}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/v1/friend-requests/${userId}`);

        toast.success("Đã xóa bạn bè thành công!");

        setUserProfile((prev: any) => ({
          ...prev,
          requestStatus: null,
        }));

        // Cập nhật lại danh sách bạn bè
        fetchFriends(userId);
      } catch (error) {
        console.error("Lỗi xóa bạn bè:", error);
        toast.error("Không thể xóa bạn bè.");
      }
    }
  };

  // Lấy danh sách bài viết
  const fetchUserPosts = async (id: string) => {
    try {
      const res = await api.get(`/api/v1/posts/user/${id}`, {
        params: {
          page: 0,
          size: 10,
        },
      });

      setUserPosts(res.data?.data?.items ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách bài viết:", error);
    }
  };

  // Hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
        <p className="text-sm sm:text-base text-gray-500 font-medium text-center">
          Đang tải trang cá nhân...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#f4f6f8] text-gray-800">
      <Header currentUser={currentUser} />

      <main className="mx-auto box-border w-full min-w-0 max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
        {/* Nút quay lại */}
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition hover:text-orange-600"
        >
          <i className="fas fa-arrow-left"></i>
          Quay lại
        </button>

        {/* Thông tin cá nhân */}
        <div className="relative mt-16 rounded-2xl border border-gray-100 bg-white px-4 pb-6 pt-16 shadow-sm sm:mt-20 sm:px-6 sm:pb-8 sm:pt-20">
          <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 sm:-top-16">
            <img
              src={
                userProfile?.avatarUrl ||
                "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
              }
              alt={userProfile?.username || "Người dùng"}
              className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md sm:h-32 sm:w-32 md:h-36 md:w-36"
            />
          </div>

          <div className="mt-3 flex w-full min-w-0 flex-col items-center gap-3 text-center">
            <h1 className="max-w-full break-words text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
              @{userProfile?.username || "Người dùng"}
            </h1>

            <p className="w-full min-w-0 break-words whitespace-pre-wrap text-sm leading-relaxed text-gray-500 sm:text-base">
              {userProfile?.note || "Chưa có giới thiệu"}
            </p>

            <div className="flex w-full max-w-xs flex-row gap-2 border-t border-gray-300 pt-3 sm:max-w-sm">
              {isMyProfile ? (
                <button
                  onClick={() => router.push("")}
                  className="mt-1 box-border w-full rounded bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] px-4 py-3 font-semibold text-white shadow-md transition-all hover:brightness-95 active:scale-[0.98]"
                >
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <>
                  {relationship === "ACCEPTED" ? (
                    <button
                      onClick={handleRemoveFriend}
                      className="mt-1 box-border w-full rounded bg-red-500 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-red-600 active:scale-[0.98]"
                    >
                      Xóa bạn bè
                    </button>
                  ) : relationship === "PENDING" ? (
                    <button
                      disabled
                      className="mt-1 box-border w-full cursor-not-allowed rounded bg-gray-400 px-4 py-3 font-semibold text-white shadow-md"
                    >
                      Đã gửi lời mời
                    </button>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      className="mt-1 box-border w-full rounded bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] px-4 py-3 font-semibold text-white shadow-md transition-all hover:brightness-95 active:scale-[0.98]"
                    >
                      Kết bạn
                    </button>
                  )}

                  <button
                    onClick={() =>
                      router.push(`/connexa/messages/${userId}`)
                    }
                    aria-label="Nhắn tin"
                    className="mt-1 flex w-14 shrink-0 items-center justify-center rounded bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] text-white shadow-md transition-all hover:brightness-95 active:scale-[0.98]"
                  >
                    <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách bạn bè */}
        <section className="mx-auto mt-6 w-full min-w-0 sm:mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-700 sm:text-lg">
              Danh sách bạn bè
            </h2>
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <FriendListProfile
              friends={friends}
              onSelectViewAll={(friendId) => {
                router.push(`/connexa/profile/${friendId}`);
              }}
            />

            {/* Chỉ hiện Hơn nữa khi có trên 5 bạn bè */}
            {totalFriends > 5 && (
              <div className="w-full rounded-2xl border mt-2 shadow-sm border border-gray-100">
                <p className="text-center text-gray-500 mt-3">Và hơn nữa...</p>
                </div>
            )}
          </div>
        </section>

        {/* Bài viết */}
        <section className="mx-auto mt-6 w-full min-w-0 sm:mt-8">
          <h2 className="mb-4 text-base font-bold text-gray-700 sm:text-lg">
            Bài viết của họ
          </h2>

          <div className="box-border w-full min-w-0 rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-400 shadow-sm sm:px-6 sm:py-10 sm:text-base">
            <PostCard
              posts={userPosts}
              onSelectViewDetail={(postId) => {
                router.push(`/connexa/post-detail/${postId}`);
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
