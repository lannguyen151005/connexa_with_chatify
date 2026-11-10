
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CreatePostCard from "./connexa/components/CreatePostCard";
import { FriendWidget } from "./connexa/components/FriendWidget";
import Header from "./connexa/components/Header";
import PostCard from "./connexa/components/PostCard";
import Sidebar from "./connexa/components/Sidebar";
import api from "./utils/api";
import { jwtDecode } from "jwt-decode";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  isOnline?: boolean;
}

type FeedMode = "feed" | "discover" | "trending";

export default function ConnexaHomePage() {
  const router = useRouter();

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Feed mode
  const [activeTab, setActiveTab] = useState<FeedMode>("feed");

  const activeTabRef = useRef<FeedMode>("feed");

  // Posts
  const [postList, setPostList] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const isFetchingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);

  const pendingFetchRef = useRef(false);

  useEffect(() => {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded.groups.includes('ADMIN')) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("Lỗi đọc token:", error);
        }
      }
    }, []);
    
  // Load posts
  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoadingPosts(true);

    const mode = activeTabRef.current;
    const currentPage = pageRef.current;

    try {
      const endpoint =
        mode === "trending"
          ? "/api/v1/posts/trending"
          : mode === "discover"
          ? "/api/v1/posts/discover"
          : "/api/v1/posts/feed";

      const [response] = await Promise.all([
        api.get(endpoint, {
          params: {
            page: currentPage,
            size: 10,
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      // Bỏ qua kết quả nếu người dùng đã chuyển tab
      if (mode !== activeTabRef.current) return;

      const items = response.data?.data?.items;

      if (!Array.isArray(items)) {
        hasMoreRef.current = false;
        setHasMorePosts(false);
        return;
      }

      setPostList((prev) => {
        // Tránh thêm bài viết trùng ID
        const existingIds = new Set(
          prev.map((post) => post.id)
        );

        const newPosts = items.filter(
          (post: any) => !existingIds.has(post.id)
        );

        return [...prev, ...newPosts];
      });

      pageRef.current = currentPage + 1;
      setPage(pageRef.current);

      if (items.length < 10) {
        hasMoreRef.current = false;
        setHasMorePosts(false);
      }
    } catch (error) {
      if (mode === activeTabRef.current) {
        console.error("Lỗi lấy danh sách bài viết:", error);
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoadingPosts(false);

      // Nếu đổi tab trong khi đang tải, tải dữ liệu của tab mới
      if (pendingFetchRef.current) {
        pendingFetchRef.current = false;
        fetchPosts();
      }
    }
  }, []);

  // Change tab
  const handleChangeTab = (mode: FeedMode) => {
    if (activeTabRef.current === mode) return;

    activeTabRef.current = mode;
    setActiveTab(mode);

    // Reset danh sách
    setPostList([]);

    // Reset pagination
    pageRef.current = 0;
    setPage(0);

    hasMoreRef.current = true;
    setHasMorePosts(true);

    if (isFetchingRef.current) {
      pendingFetchRef.current = true;
    } else {
      fetchPosts();
    }
  };

  // Authentication and initial data
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

        const user = userRes.data?.data;

        setCurrentUser(user);
        setMyUserId(userId);

        const items = friendRes.data?.data?.items;

        if (Array.isArray(items)) {
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
        }

        await fetchPosts();
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
  }, [router, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const target = observerRef.current;

    if (!target || isAuthLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          !isFetchingRef.current &&
          hasMoreRef.current
        ) {
          fetchPosts();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isAuthLoading, fetchPosts, postList.length]);

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
        isAdmin={isAdmin}
        currentUser={currentUser}
        onViewFriendList={() => {
          router.push("/connexa/friends");
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">

          {/* Sidebar */}
          <div className="hidden md:col-span-3 md:block">
            <Sidebar
              currentUser={currentUser}
              activeTab={activeTab}
              onDiscoverClick={() =>
                handleChangeTab("discover")
              }
              onHomeClick={() =>
                handleChangeTab("feed")
              }
              onTrendingClick={() =>
                handleChangeTab("trending")
              }
            />
          </div>

          <div className="space-y-5 md:col-span-6">

            {activeTab === "feed" && (
              <CreatePostCard currentUser={currentUser} />
            )}

            <PostCard
              posts={postList}
              currentUserId={myUserId}
              currentUser={currentUser}
              onSelectViewDetail={(postId) => {
                router.push(
                  `/connexa/post-detail/${postId}`
                );
              }}
            />

            <div
              ref={observerRef}
              className="flex min-h-[60px] items-center justify-center"
            >
              {isLoadingPosts && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

                  <p className="text-sm text-gray-500">
                    Đang tải thêm bài viết...
                  </p>
                </div>
              )}

              {!isLoadingPosts &&
                !hasMorePosts &&
                postList.length > 0 && (
                  <p className="py-4 text-sm text-gray-400">
                    Bạn đã xem hết bài viết!
                  </p>
                )}

            </div>
          </div>

          {/* Friends */}
          <div className="hidden md:col-span-3 md:block">
            <div className="sticky top-20 space-y-5">
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

        </div>
      </main>
    </div>
  );
}
