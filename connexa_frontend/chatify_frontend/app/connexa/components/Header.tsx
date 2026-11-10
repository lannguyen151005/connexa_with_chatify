
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";

interface HeaderProps {
  isAdmin?: boolean;
  currentUser: any;
  onViewFriendList?: () => void;
}

interface SearchUser {
  id: string;
  username: string;
  avatar_url?: string;
  avatarUrl?: string;
}

interface SearchPost {
  id: string;
  content: string;
  created_at?: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

type SearchType = "users" | "posts";

export default function Header({
  currentUser,
  onViewFriendList,
  isAdmin,
}: HeaderProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("users");

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Debounce search
  useEffect(() => {
    const value = keyword.trim();

    if (!value) {
      setUsers([]);
      setPosts([]);
      setIsSearching(false);
      setSearchError(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(false);

      try {
        const response =
          searchType === "users"
            ? await api.get("/api/v1/users/search", {
              params: {
                keyword: value,
                page: 0,
                size: 5,
              },
            })
            : await api.get("/api/v1/posts/search", {
              params: {
                keyword: value,
                page: 0,
                size: 5,
              },
            });

        if (cancelled) return;

        const items = response.data?.data?.items;

        if (searchType === "users") {
          setUsers(Array.isArray(items) ? items : []);
          setPosts([]);
        } else {
          setPosts(Array.isArray(items) ? items : []);
          setUsers([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Lỗi tìm kiếm:", error);
          setUsers([]);
          setPosts([]);
          setSearchError(true);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, searchType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Change search type
  const handleChangeSearchType = (type: SearchType) => {
    setSearchType(type);
    setUsers([]);
    setPosts([]);
    setSearchError(false);

    if (keyword.trim()) {
      setIsOpen(true);
    }
  };

  // Enter to search all
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }

    if (event.key === "Enter" && keyword.trim()) {
      setIsOpen(false);

      router.push(
        `/connexa/search?q=${encodeURIComponent(
          keyword.trim()
        )}&type=${searchType}`
      );
    }
  };

  const handleSelectResult = (url: string) => {
    setIsOpen(false);
    setKeyword("");
    router.push(url);
  };

  const hasResults =
    searchType === "users"
      ? users.length > 0
      : posts.length > 0;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-[#3BBDF7] px-4 py-2.5 text-white shadow-md sm:px-6">

      {/* Logo */}
      <div className="shrink-0">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-white !no-underline drop-shadow"
        >
          Connexa
        </Link>
      </div>

      {/* Search */}
      <div
        ref={searchRef}
        className="relative mx-2 w-full max-w-lg"
      >
        <div className="flex items-center rounded-full bg-white px-2 py-1 shadow-inner focus-within:ring-2 focus-within:ring-orange-300">

          {/* Search type buttons */}
          <div className="flex shrink-0 items-center gap-1 border-r border-gray-200 pr-2">

            <button
              type="button"
              onClick={() =>
                handleChangeSearchType("users")
              }
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${searchType === "users"
                ? "bg-[#3BBDF7] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              Người dùng
            </button>

            <button
              type="button"
              onClick={() =>
                handleChangeSearchType("posts")
              }
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${searchType === "posts"
                ? "bg-[#3BBDF7] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              Bài viết
            </button>

          </div>

          {/* Search input */}
          <div className="relative min-w-0 flex-1">

            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

            <input
              type="text"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (keyword.trim()) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={
                searchType === "users"
                  ? "Tìm người dùng..."
                  : "Tìm bài viết..."
              }
              className="w-full min-w-0 bg-transparent py-2 pl-9 pr-7 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />

            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setUsers([]);
                  setPosts([]);
                  setIsOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label="Xóa từ khóa"
              >
                <i className="fas fa-times" />
              </button>
            )}

          </div>
        </div>

        {/* Search dropdown */}
        {isOpen && keyword.trim() && (
          <div className="absolute left-0 top-full z-[100] mt-2 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 text-gray-800 shadow-xl">

            {isSearching ? (
              <div className="flex items-center justify-center gap-3 p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-gray-500">
                  Đang tìm kiếm...
                </span>
              </div>
            ) : searchError ? (
              <div className="p-6 text-center text-sm text-red-500">
                Không thể thực hiện tìm kiếm. Vui lòng thử lại.
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center">
                <i className="fas fa-search mb-2 text-2xl text-gray-300" />

                <p className="text-sm text-gray-500">
                  Không tìm thấy kết quả phù hợp.
                </p>
              </div>
            ) : (
              <>
                {/* Users */}
                {searchType === "users" && (
                  <section>

                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() =>
                          handleSelectResult(
                            `/connexa/profile/${user.id}`
                          )
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                      >
                        <img
                          src={
                            user.avatar_url ||
                            user.avatarUrl ||
                            "/default-avatar.png"
                          }
                          alt={user.username}
                          className="h-10 w-10 shrink-0 rounded-full bg-gray-100 object-cover"
                        />

                        <div className="min-w-0 flex-col flex items-start gap-0.5 overflow-hidden">
                          <span className="truncate text-sm font-semibold text-gray-800">
                            {user.username}
                          </span>

                          <span className="text-xs text-gray-400">
                            Xem trang cá nhân
                          </span>
                        </div>

                        <i className="fas fa-chevron-right ml-auto shrink-0 text-xs text-gray-300" />
                      </button>
                    ))}
                  </section>
                )}

                {/* Posts */}
                {searchType === "posts" && (
                  <section>

                    {posts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() =>
                          handleSelectResult(
                            `/connexa/post-detail/${post.id}`
                          )
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                      >
                        <img
                          src={
                            post.author?.avatar_url ||
                            "/default-avatar.png"
                          }
                          alt={
                            post.author?.username ||
                            "Người dùng"
                          }
                          className="h-9 w-9 shrink-0 rounded-full bg-gray-100 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-gray-700">
                            {post.author?.username || "Người dùng"}
                          </span>

                          <span className="mt-1 line-clamp-2 break-words text-sm text-gray-500">
                            {post.content}
                          </span>
                        </div>
                        <i className="fas fa-chevron-right ml-auto shrink-0 text-xs text-gray-300" />

                      </button>
                    ))}
                  </section>
                )}

                {/* View all */}

              </>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">

        {isAdmin && (
          <button
            className="relative p-1.5 transition hover:opacity-80"
            onClick={() => { router.push('/admin'); }}
          >
            <i className="fas fa-user-shield text-lg" />
          </button>
        )}

        <Link
          href="/"
          className="p-1.5 transition hover:opacity-80"
          title="Trang chủ"
        >
          <i className="fas fa-home text-lg" />
        </Link>

        <button
          type="button"
          className="relative p-1.5 transition hover:opacity-80"
          aria-label="Thông báo"
        >
          <i className="fas fa-bell text-lg" />
        </button>

        <Link
          href="/chat"
          className="p-1.5 transition hover:opacity-80"
          title="Mở tin nhắn"
        >
          <i className="fas fa-comments text-lg" />
        </Link>

        <button
          type="button"
          className="p-1.5 transition hover:opacity-80"
          onClick={onViewFriendList}
          title="Danh sách bạn bè"
          aria-label="Danh sách bạn bè"
        >
          <i className="fas fa-users text-lg" />
        </button>

        <Link
          href={
            currentUser?.id
              ? `/connexa/profile/${currentUser.id}`
              : "/"
          }
          className="ml-1 h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 shadow"
          title="Trang cá nhân"
        >
          <img
            src={
              currentUser?.avatarUrl ||
              currentUser?.avatar_url ||
              "/default-avatar.png"
            }
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
