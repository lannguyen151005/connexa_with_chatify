"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import DashboardView from './components/DashboardView';
import UserManageView from './components/users/UserManageView';
import RoomManageView from './components/rooms/RoomManageView';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import ModulePlaceholderView from './components/ModulePlaceholderView';
import PostManageView from './components/posts/PostManageView';
import ReportManageView from './components/reports/ReportManageView';
import { AdminMenuTab, AdminProfile } from './types';

export default function AdminWorkspace() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<AdminMenuTab>('DASHBOARD');
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    username: 'Admin',
    avatar_url: '',
    role: 'ADMIN',
  });
  const [isAuth, setIsAuth] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(3);

  useEffect(() => {
    // Chế độ phát triển giao diện: bypass kiểm tra Auth nếu bật cờ trong .env.local
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      setAdminProfile({
        username: 'Admin Dev',
        avatar_url: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
        role: 'SUPER_ADMIN',
      });
      setIsAuth(true);
      return;
    }

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.groups || !decoded.groups.includes('ADMIN')) { 
        toast.error("Bạn không có quyền truy cập!");
        router.push('/'); 
        return;
      }
      setAdminProfile({
        username: decoded.sub || 'Admin',
        avatar_url: decoded.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
        role: 'ADMIN',
      });
      setIsAuth(true); 
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    router.push('/login');
  };

  if (!isAuth) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-500">
          Đang xác thực quyền Quản trị viên...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* CỘT TRÁI: SIDEBAR (Tailwind CSS) */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        adminProfile={adminProfile} 
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        closeSidebar={() => setIsMobileSidebarOpen(false)}
        pendingReportsCount={pendingReportsCount}
      />

      {/* CỘT PHẢI: TOPBAR & NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOPBAR) */}
        <AdminHeader
          activeMenu={activeMenu}
          adminProfile={adminProfile}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* VÙNG NỘI DUNG CUỘN ĐỘC LẬP */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeMenu === 'DASHBOARD' && (
              <DashboardView onNavigateTab={setActiveMenu} />
            )}

            {activeMenu === 'POSTS' && (
              <PostManageView onNavigateTab={setActiveMenu} />
            )}

            {activeMenu === 'REPORTS' && (
              <ReportManageView onPendingCountChange={setPendingReportsCount} />
            )}

            {activeMenu === 'USERS' && <UserManageView />}

            {activeMenu === 'ROOMS' && <RoomManageView />}

            {activeMenu === 'AI_SETTINGS' && (
              <ModulePlaceholderView
                tab="AI_SETTINGS"
                onNavigateDashboard={() => setActiveMenu('DASHBOARD')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}