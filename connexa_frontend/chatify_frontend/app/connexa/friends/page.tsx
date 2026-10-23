
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import api from "../../utils/api";


import FriendList from "./components/FriendList";
import FriendPagination from "./components/FriendPagination";
import { useFriends } from "./services/useFriends";
import FriendsHeader from "./components/FriendHeader";


export default function FriendsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const {
    friends,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    fetchFriends,
  } = useFriends(userId);

  
useEffect(() => {
  const token = localStorage.getItem("jwt_token");
  const storedUserId = localStorage.getItem("user_id");

  if (!token) {
    router.replace("/login");
    return;
  }

  if (!storedUserId) {
    setAuthLoading(false);
    return;
  }

  // Thiết lập ID ngay để hook useFriends có thể tải dữ liệu.
  setUserId(storedUserId);

  let cancelled = false;

  async function loadUser() {
    try {
      const response = await api.get(
        `/api/users/profile/${storedUserId}`
      );

      if (cancelled) return;

      const user = response.data?.data;

      if (user) {
        setCurrentUser({
          ...user,
          avatarUrl:
            user.avatarUrl ||
            user.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin tài khoản:", err);
    } finally {
      if (!cancelled) {
        setAuthLoading(false);
      }
    }
  }

  void loadUser();

  return () => {
    cancelled = true;
  };
}, [router]);

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesSearch && (!onlineOnly || friend._online);
  });

  const onlineCount = friends.filter(
    (friend) => friend._online
  ).length;

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      <Header currentUser={currentUser} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="hidden md:col-span-3 md:block">
            {!authLoading && currentUser && (
              <Sidebar currentUser={currentUser} />
            )}
          </aside>

          <section className="min-w-0 space-y-5 md:col-span-9">
            <FriendsHeader
              totalElements={totalElements}
              onlineCount={onlineCount}
              search={search}
              onSearchChange={setSearch}
              onlineOnly={onlineOnly}
              onOnlineOnlyChange={setOnlineOnly}
            />

            <FriendList
              friends={filteredFriends}
              loading={authLoading || loading}
              error={
                !authLoading && !userId
                  ? "Không tìm thấy thông tin người dùng."
                  : error
              }
              search={search}
              onlineOnly={onlineOnly}
              onRetry={() => fetchFriends(page)}
              onClearFilters={() => {
                setSearch("");
                setOnlineOnly(false);
              }}
            />

            {!authLoading && !loading && !error && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <FriendPagination
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={fetchFriends}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
