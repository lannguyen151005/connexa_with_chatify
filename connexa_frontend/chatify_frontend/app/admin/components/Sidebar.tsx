"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminMenuTab, AdminProfile } from '../types';

interface SidebarProps {
  activeMenu: AdminMenuTab;
  setActiveMenu: (menu: AdminMenuTab) => void;
  adminProfile: AdminProfile;
  onLogout: () => void;
  isOpen: boolean;       
  closeSidebar: () => void;
  pendingReportsCount?: number;
}

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  adminProfile,
  onLogout,
  isOpen,
  closeSidebar,
  pendingReportsCount = 3,
}: SidebarProps) {
  const router = useRouter();

  const handleMenuClick = (menu: AdminMenuTab) => {
    setActiveMenu(menu);
    closeSidebar();
  };

  const navItemClass = (menu: AdminMenuTab) => {
    const isActive = activeMenu === menu;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
    }`;
  };

  const iconClass = (iconName: string, menu: AdminMenuTab) => {
    const isActive = activeMenu === menu;
    return `fas ${iconName} w-5 text-center mr-3 text-base ${
      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center p-1 border border-blue-100 shadow-xs">
                <img
                  src="/logo.png"
                  alt="Connexa Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback nếu logo.png chưa có
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-800 block leading-tight">
                  CONNEXA
                </span>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Admin Workspace
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Đóng menu"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Admin Profile Card */}
          <div className="p-4 mx-3 my-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={adminProfile.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"}
                alt={adminProfile.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-800 truncate leading-snug">
                  {adminProfile.username}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-emerald-600 truncate">Quản trị viên</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu (Scrollable) */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
            {/* Group 1: TỔNG QUAN */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Tổng quan
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleMenuClick('DASHBOARD')}
                    className={navItemClass('DASHBOARD')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-chart-pie', 'DASHBOARD')}></i>
                      <span>Dashboard Thống kê</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 2: MẠNG XÃ HỘI (CONNEXA) */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Mạng xã hội (Connexa)
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleMenuClick('POSTS')}
                    className={navItemClass('POSTS')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-newspaper', 'POSTS')}></i>
                      <span>Quản lý Bài viết</span>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleMenuClick('REPORTS')}
                    className={navItemClass('REPORTS')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-shield-halved', 'REPORTS')}></i>
                      <span>Xử lý Báo cáo</span>
                    </span>
                    {pendingReportsCount > 0 && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        activeMenu === 'REPORTS'
                          ? 'bg-white text-blue-600'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {pendingReportsCount}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 3: NHẮN TIN (CHATIFY) */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Nhắn tin (Chatify)
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleMenuClick('ROOMS')}
                    className={navItemClass('ROOMS')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-comments', 'ROOMS')}></i>
                      <span>Hội thoại & Nhóm</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 4: TÀI KHOẢN & HỆ THỐNG */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Tài khoản & Hệ thống
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleMenuClick('USERS')}
                    className={navItemClass('USERS')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-users-gear', 'USERS')}></i>
                      <span>Quản lý Người dùng</span>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleMenuClick('AI_SETTINGS')}
                    className={navItemClass('AI_SETTINGS')}
                  >
                    <span className="flex items-center">
                      <i className={iconClass('fa-robot', 'AI_SETTINGS')}></i>
                      <span>Trợ lý AI & Cấu hình</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 bg-white space-y-1.5">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer"
            >
              <i className="fas fa-house w-5 text-center text-slate-400"></i>
              <span>Về Trang chủ Connexa</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            >
              <i className="fas fa-arrow-right-from-bracket w-5 text-center text-rose-500"></i>
              <span>Đăng xuất</span>
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 block font-mono">
                Connexa v1.0 • Admin Workspace
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}