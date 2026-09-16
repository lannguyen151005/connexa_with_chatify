"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeMenu: 'DASHBOARD' | 'USERS' | 'ROOMS';
  setActiveMenu: (menu: 'DASHBOARD' | 'USERS' | 'ROOMS') => void;
  adminProfile: { username: string; avatar_url: string };
  onLogout: () => void;
  // Thêm 2 props này để quản lý trạng thái Mobile
  isOpen: boolean;       
  closeSidebar: () => void;
}

export default function Sidebar({ activeMenu, setActiveMenu, adminProfile, onLogout, isOpen, closeSidebar }: SidebarProps) {
  const router = useRouter();

  // Khi bấm chọn menu trên mobile thì tự động đóng thanh sidebar lại
  const handleMenuClick = (menu: 'DASHBOARD' | 'USERS' | 'ROOMS') => {
    setActiveMenu(menu);
    closeSidebar(); 
  };

  return (
    <div className={`d-flex flex-column flex-shrink-0 p-3 bg-white shadow-sm z-3 custom-sidebar ${isOpen ? 'open' : ''}`} style={{ width: '280px' }}>
      
      {/* Brand & Nút Đóng (Chỉ hiện trên Mobile) */}
      <div className="d-flex align-items-center justify-content-between mb-2 px-2">
        <a href="#" className="d-flex align-items-center link-dark text-decoration-none">
          <div className="rounded p-2 ms-3 me-4 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px'}}>
            <img src="/logo.png" alt="logo" className='rounded-circle' style={{width: "70px", height: "70px", objectFit: "cover", imageRendering: "auto"}}/>
          </div>
          <span className="fs-5 fw-bold text-primary">Xin chào, <br></br>Admin!</span>
        </a>
        <button className="btn btn-light d-md-none border-0" onClick={closeSidebar}>
          <i className="fas fa-times fs-5 text-secondary"></i>
        </button>
      </div>
      <hr className="mt-0" />

      {/* Thông tin Admin */}
      <div className="d-flex align-items-center p-2 mb-3 rounded border bg-light">
        <img src={adminProfile.avatar_url} alt="Admin" width="45" height="45" className="rounded-circle shadow-sm bg-white" />
        <div className="ms-3 overflow-hidden">
          <h6 className="mb-0 fw-bold text-truncate">{adminProfile.username}</h6>
          <small className="text-success"><i className="fas fa-circle me-1" style={{fontSize: "8px"}}></i>Đang hoạt động</small>
        </div>
      </div>

      {/* Menu Điều hướng */}
      <ul className="nav nav-pills flex-column mb-auto fs-6 fw-medium">
        <li className="nav-item mb-1">
          <button 
            className={`nav-link w-100 text-start px-3 py-2 ${activeMenu === 'DASHBOARD' ? 'text-primary fw-bold shadow-sm' : 'text-dark'}`}
            style={{ backgroundColor: activeMenu === 'DASHBOARD' ? '#d6f0f4' : 'transparent', transition: 'all 0.2s' }}
            onClick={() => handleMenuClick('DASHBOARD')}
          >
            <i className="fas fa-chart-pie me-3 w-20px text-center"></i> Dashboard
          </button>
        </li>
        <li className="nav-item mb-1">
          <button 
            className={`nav-link w-100 text-start px-3 py-2 ${activeMenu === 'USERS' ? 'text-primary fw-bold shadow-sm' : 'text-dark'}`}
            style={{ backgroundColor: activeMenu === 'USERS' ? '#d6f0f4' : 'transparent', transition: 'all 0.2s' }}
            onClick={() => handleMenuClick('USERS')}
          >
            <i className="fas fa-users me-3 w-20px text-center"></i> Quản lý User
          </button>
        </li>
        <li className="nav-item mb-1">
          <button 
            className={`nav-link w-100 text-start px-3 py-2 ${activeMenu === 'ROOMS' ? 'text-primary fw-bold shadow-sm' : 'text-dark'}`}
            style={{ backgroundColor: activeMenu === 'ROOMS' ? '#d6f0f4' : 'transparent', transition: 'all 0.2s' }}
            onClick={() => handleMenuClick('ROOMS')}
          >
            <i className="fas fa-comments me-3 w-20px text-center"></i> Quản lý Phòng
          </button>
        </li>
      </ul>
      <hr />
      
      {/* Nút Về App & Đăng xuất */}
      <div className="d-flex flex-column gap-2">
        <button className="btn btn-outline-primary text-start" onClick={() => router.push('/')}>
          <i className="fas fa-paper-plane me-2"></i> Trở về App Chat
        </button>
        <button className="btn btn-danger text-start shadow-sm" onClick={onLogout}>
          <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
}