
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
  const [postList, setPostList] = useState<any[]>([]);

  // Xác thực người dùng và lấy ID
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

    setMyUserId(userId);
    setIsAuthLoading(false);
  }, [router]);

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (isAuthLoading || !myUserId) return;

    let cancelled = false;

    const getFriendList = async () => {
      try {
        const res = await api.get(
          `/api/v1/friend-requests/${myUserId}`,
          {
            params: {
              page: 0,
              size: 10,
            },
          }
        );

        const items = res.data?.data?.items;

        if (!Array.isArray(items)) {
          console.error("API không trả về danh sách bạn bè hợp lệ:", res.data);
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

        formattedData.sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return 0;
        });

        if (!cancelled) {
          setFriendList(formattedData);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
      }
    };

    getFriendList();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, myUserId]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d6f0f4]">
        <div className="text-center">
          <div
            className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
            role="status"
          />
          <p className="text-sm font-bold text-gray-500">
            Đang xác thực tài khoản...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="hidden md:col-span-3 md:block">
            <Sidebar />
          </div>

          <div className="space-y-5 md:col-span-6">
            <CreatePostCard />
            <PostCard posts={postList}
              onSelectViewDetail={(postId) => {
                router.push(`connexa/post-detail/${postId}`)
              }} />
          </div>

          <div className="hidden space-y-5 md:col-span-3 md:block">
            <FriendWidget
              friends={friendList}
              onSelectViewAll={(id) =>
                router.push(`/connexa/profile/${id}`)
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
