"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreatePostCard from "./connexa/components/CreatePostCard";
import { FriendWidget } from "./connexa/components/FriendWidget";
import Header from "./connexa/components/Header";
import PostCard from "./connexa/components/PostCard";
import Sidebar from "./connexa/components/Sidebar";
import api from "./utils/api";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  isOnline?: boolean;
}

export default function ConnexaHomePage() {
  const router = useRouter();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [postList, setPostList] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const userId = localStorage.getItem("user_id");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!userId) {
      console.error("Không tìm thấy user_id trong localStorage");
      setIsAuthLoading(false);
      return;
    }

    let cancelled = false;

    const loadHomeData = async () => {
      try {
        // Gọi đồng thời hai API
        const [friendRes, userRes] = await Promise.all([
          api.get(`/api/v1/friend-requests/${userId}`, {
            params: {
              page: 0,
              size: 10,
            },
          }),
          api.get(`/api/users/profile/${userId}`),
        ]);

        if (cancelled) return;

        // Xử lý thông tin user
        const user = userRes.data?.data;
        setCurrentUser(user);
        setMyUserId(userId);

        // Xử lý danh sách bạn bè
        const items = friendRes.data?.data?.items;

        if (!Array.isArray(items)) {
          console.error(
            "API không trả về danh sách bạn bè hợp lệ:",
            friendRes.data
          );
          return;
        }

        const formattedData: Friend[] = items.map((item: any) => ({
          id: item.id,
          username: item.username || "Unknown User",
          avatar_url:
            item.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          isOnline: item._online ?? false,
        }));

        formattedData.sort(
          (a, b) => Number(b.isOnline) - Number(a.isOnline)
        );

        setFriendList(formattedData);
      } catch (error) {
        if (!cancelled) {
          console.error("Lỗi lấy dữ liệu trang chủ:", error);
        }
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d6f0f4]">
        <div className="text-center">
          <div
            className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
            role="status"
          />
          <p className="text-sm font-bold text-gray-500">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      <Header
        currentUser={currentUser}
        onViewFriendList={() => {
          router.push("/connexa/friends")
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="hidden md:col-span-3 md:block">
            <Sidebar
              currentUser={currentUser}
            />
          </div>

          <div className="space-y-5 md:col-span-6">
            <CreatePostCard
              currentUser={currentUser}
            />
            <PostCard
              posts={postList}
              onSelectViewDetail={(postId) => {
                router.push(`/connexa/post-detail/${postId}`);
              }}
            />
          </div>

          <div className="hidden space-y-5 md:col-span-3 md:block">
            <FriendWidget
              friends={friendList}
              onSelectViewAll={() => {
                router.push("/connexa/friends");
              }}
              onSelectViewProfile={(id) => {
                router.push(`/connexa/profile/${id}`);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}