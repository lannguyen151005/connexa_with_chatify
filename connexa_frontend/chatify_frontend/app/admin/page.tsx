"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import DashboardView from './components/DashboardView';
import UserManageView from './components/UserManageView';
import RoomManageView from './components/RoomManageView';
import Sidebar from './components/Sidebar';

export default function AdminWorkspace() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'DASHBOARD' | 'USERS' | 'ROOMS'>('DASHBOARD');
  const [adminProfile, setAdminProfile] = useState({ username: 'Admin', avatar_url: '' });
  const [isAuth, setIsAuth] = useState(false);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.groups.includes('ADMIN')) { 
        toast.error("Bạn không có quyền truy cập!");
        router.push('/'); 
        return;
      }
      setAdminProfile({
        username: decoded.sub || 'Admin',
        avatar_url: decoded.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
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

  if (!isAuth) return <div className="vh-100 bg-light d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="d-flex flex-column flex-md-row vh-100 bg-light overflow-hidden">
      
      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG (CHỈ HIỆN TRÊN MOBILE) */}
      <div className="mobile-topbar d-md-none d-flex justify-content-between align-items-center p-3 bg-white shadow-sm z-2">
        <div className="d-flex align-items-center">
           <div className=" rounded p-1 mx-4" style={{width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
             <img src="/logo.png" alt="logo" className='rounded-circle' style={{width: "70px", height: "70px", objectFit: "cover", imageRendering: "auto"}}/>
           </div>
           <span className="fw-bold text-primary fs-5">Xin chào, Admin!</span>
        </div>
        <button className="btn btn-light border-0 shadow-sm" onClick={() => setIsMobileSidebarOpen(true)}>
          <i className="fas fa-bars fs-5"></i>
        </button>
      </div>
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* CỘT TRÁI: SIDEBAR */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        adminProfile={adminProfile} 
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        closeSidebar={() => setIsMobileSidebarOpen(false)}
      />

      {/* CỘT PHẢI: NỘI DUNG ĐỘNG */}
      <div className="flex-grow-1 p-3 p-md-4 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
        {activeMenu === 'DASHBOARD' && <DashboardView />}
        {activeMenu === 'USERS' && <UserManageView />}
        {activeMenu === 'ROOMS' && <RoomManageView />}
      </div>

      {/* STYLE HIỆU ỨNG VÀ RESPONSIVE */}
      <style jsx global>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* 🌟 RESPONSIVE CSS CHO MOBILE SIDEBAR */
        @media (max-width: 767.98px) {
          .custom-sidebar {
            position: fixed;
            top: 0;
            left: -300px; /* Ẩn ra ngoài màn hình bên trái */
            height: 100vh;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1050 !important;
          }
          .custom-sidebar.open {
            left: 0; /* Vuốt vào trong màn hình */
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1040;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </div>
  );
}