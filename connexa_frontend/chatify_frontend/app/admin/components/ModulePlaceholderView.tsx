"use client";

import React from 'react';
import { AdminMenuTab } from '../types';

interface ModulePlaceholderViewProps {
  tab: AdminMenuTab;
  onNavigateDashboard: () => void;
}

const TAB_INFO: Record<AdminMenuTab, { title: string; category: string; description: string; icon: string; plannedFeatures: string[] }> = {
  DASHBOARD: {
    title: "Tổng quan Hệ thống",
    category: "Thống kê",
    description: "Theo dõi chỉ số tăng trưởng và hoạt động toàn mạng xã hội",
    icon: "fa-chart-pie",
    plannedFeatures: [],
  },
  POSTS: {
    title: "Quản lý Bài viết & Bảng tin",
    category: "Mạng xã hội Connexa",
    description: "Khu vực kiểm duyệt, tìm kiếm và quản lý nội dung công khai đăng trên Newsfeed",
    icon: "fa-newspaper",
    plannedFeatures: [
      "Xem danh sách toàn bộ bài viết trên hệ thống kèm ảnh thumbnail",
      "Tìm kiếm bài viết theo từ khóa nội dung hoặc tên người đăng",
      "Ẩn bài viết nhạy cảm hoặc gỡ bỏ bài viết vi phạm",
      "Ghim bài viết thông báo của Quản trị viên lên đầu trang chủ",
    ],
  },
  REPORTS: {
    title: "Trung tâm Xử lý Báo cáo Vi phạm",
    category: "Kiểm duyệt & An toàn",
    description: "Tiếp nhận và giải quyết khiếu nại, tố cáo nội dung từ người dùng",
    icon: "fa-shield-halved",
    plannedFeatures: [
      "Bộ lọc trạng thái: Chờ duyệt (Pending), Đã xử lý (Resolved), Bác bỏ (Dismissed)",
      "Xem chi tiết đơn tố cáo: Người báo cáo, bài viết/comment vi phạm, bằng chứng",
      "Thao tác xử lý 1 chạm: Gỡ nội dung + Cảnh cáo tác giả",
      "Gắn cờ và xử phạt tài khoản tái phạm nhiều lần",
    ],
  },
  USERS: {
    title: "Quản lý Người dùng & Kỷ luật",
    category: "Tài khoản & Phân quyền",
    description: "Quản lý danh sách thành viên, phân quyền và thi hành kỷ luật",
    icon: "fa-users-gear",
    plannedFeatures: [],
  },
  ROOMS: {
    title: "Quản lý Cuộc trò chuyện & Nhóm chat",
    category: "Nhắn tin Chatify",
    description: "Kiểm soát các phòng chat và nhóm trò chuyện",
    icon: "fa-comments",
    plannedFeatures: [],
  },
  AI_SETTINGS: {
    title: "Trợ lý AI Charles & Cấu hình Hệ thống",
    category: "Trí tuệ nhân tạo & Cài đặt",
    description: "Giám sát hiệu suất bot, theo dõi mức tiêu hao token và cấu hình thông báo",
    icon: "fa-robot",
    plannedFeatures: [
      "Bật/Tắt trợ lý AI và điều chỉnh quyền truy cập của người dùng",
      "Thống kê tổng số token đã dùng và biểu đồ truy vấn AI theo thời gian",
      "Quản lý danh sách từ khóa cấm (Bad words blacklist)",
      "Phát thông báo hệ thống (System Announcements) đến toàn bộ người dùng",
    ],
  },
};

export default function ModulePlaceholderView({ tab, onNavigateDashboard }: ModulePlaceholderViewProps) {
  const info = TAB_INFO[tab] || TAB_INFO.POSTS;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-fadeIn">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-xs">
          <i className={`fas ${info.icon}`}></i>
        </div>

        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 rounded-full mb-3">
          {info.category}
        </span>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {info.title}
        </h3>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {info.description}
        </p>

        {info.plannedFeatures.length > 0 && (
          <div className="text-left bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <i className="fas fa-list-check text-blue-500"></i>
              Các tính năng sẽ triển khai ở bước tiếp theo:
            </h4>
            <ul className="space-y-2">
              {info.plannedFeatures.map((feat, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onNavigateDashboard}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Quay về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
