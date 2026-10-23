
"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  currentUser: any;
  onViewFriendList?: () => void;
}

export default function Header({
  currentUser,
  onViewFriendList,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-[#3BBDF7] px-6 py-2.5 text-white shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl font-black text-white !no-underline tracking-tight drop-shadow">
          Connexa
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mx-4 w-full max-w-lg">
        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>

        <input
          type="text"
          placeholder="Tìm kiếm người dùng, bài viết,..."
          className="w-full rounded-full bg-white py-2 pl-10 pr-4 text-sm text-gray-800 shadow-inner outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-5">
        {/* Trang chủ */}
        <Link href="/" className="p-1.5 transition hover:opacity-80" title="Trang chủ">
          <i className="fas fa-home text-lg"></i>
        </Link>

        {/* Thông báo */}
        <button
          type="button"
          className="relative p-1.5 transition hover:opacity-80"
          aria-label="Thông báo"
        >
          <i className="fas fa-bell text-lg"></i>
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-300 text-[10px] font-bold text-orange-900"></span>
        </button>

        {/* Tin nhắn */}
        <Link
          href="/chat"
          className="p-1.5 transition hover:opacity-80"
          title="Mở tin nhắn"
        >
          <i className="fas fa-comments text-lg"></i>
        </Link>

        {/* Danh sách bạn bè */}
        <button
          type="button"
          className="p-1.5 transition hover:opacity-80"
          onClick={onViewFriendList}
          title="Danh sách bạn bè"
          aria-label="Danh sách bạn bè"
        >
          <i className="fas fa-users text-lg"></i>
        </button>

        {/* Avatar */}
        <Link
          href={
            currentUser?.id
              ? `/connexa/profile/${currentUser.id}`
              : "/"
          }
          className="ml-2 h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 shadow"
          title="Trang cá nhân"
        >
          <img
            src={
              currentUser?.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
