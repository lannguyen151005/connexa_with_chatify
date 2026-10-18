"use client";

import React, { useEffect, useState } from 'react';
import { AdminMenuTab, AdminProfile } from '../types';

interface AdminHeaderProps {
  activeMenu: AdminMenuTab;
  adminProfile: AdminProfile;
  onOpenMobileSidebar: () => void;
}

const TAB_BREADCRUMBS: Record<AdminMenuTab, { category: string; label: string }> = {
  DASHBOARD: { category: "Tổng quan", label: "Dashboard Thống kê" },
  POSTS: { category: "Mạng xã hội", label: "Quản lý Bài viết" },
  REPORTS: { category: "Mạng xã hội", label: "Xử lý Báo cáo Vi phạm" },
  USERS: { category: "Tài khoản & Hệ thống", label: "Quản lý Người dùng" },
  ROOMS: { category: "Nhắn tin Chatify", label: "Hội thoại & Nhóm chat" },
  AI_SETTINGS: { category: "Tài khoản & Hệ thống", label: "Trợ lý AI & Cấu hình" },
};

export default function AdminHeader({
  activeMenu,
  adminProfile,
  onOpenMobileSidebar,
}: AdminHeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const breadcrumb = TAB_BREADCRUMBS[activeMenu] || TAB_BREADCRUMBS.DASHBOARD;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Mở thanh điều hướng"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm">
          <span className="font-semibold text-slate-400 hidden sm:inline">Admin</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-500 font-medium hidden sm:inline">{breadcrumb.category}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
            {breadcrumb.label}
          </span>
        </nav>
      </div>

      {/* Right side: Realtime Clock, Status badge & Profile mini */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* System Health Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống bình thường</span>
        </div>

        {/* Current Date Time */}
        {currentDateTime && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <i className="far fa-clock text-slate-400"></i>
            <span>{currentDateTime}</span>
          </div>
        )}

        {/* Admin Mini Profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l sm:border-slate-200">
          <img
            src={adminProfile.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"}
            alt={adminProfile.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
          />
          <span className="text-xs font-bold text-slate-700 hidden md:inline truncate max-w-[120px]">
            {adminProfile.username}
          </span>
        </div>
      </div>
    </header>
  );
}
