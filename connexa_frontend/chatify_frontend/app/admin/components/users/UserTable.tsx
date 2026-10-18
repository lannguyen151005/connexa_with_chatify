"use client";

import React from 'react';
import { AdminUser } from './types';

interface UserTableProps {
  users: AdminUser[];
  onViewProfile: (user: AdminUser) => void;
  onOpenLock: (user: AdminUser) => void;
  onUnlock: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserTable({
  users,
  onViewProfile,
  onOpenLock,
  onUnlock,
  onDelete,
}: UserTableProps) {
  const statusBadge = (user: AdminUser) => {
    switch (user.status) {
      case 'ACTIVE':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Hoạt động
          </span>
        );
      case 'LOCKED':
        return (
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 cursor-help"
            title={user.lockInfo?.reason || "Tài khoản đang bị khóa kỷ luật"}
          >
            <i className="fas fa-lock text-[10px]"></i>
            Bị khóa
          </span>
        );
      case 'DELETED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Đã xóa
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[240px]">Thành viên</th>
              <th className="py-3.5 px-4">Email & Ngày tham gia</th>
              <th className="py-3.5 px-4 w-[170px] text-center">Hoạt động MXH</th>
              <th className="py-3.5 px-4 w-[140px] text-center">Trạng thái</th>
              <th className="py-3.5 px-4 w-[130px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. THÀNH VIÊN */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={
                        user.avatarUrl ||
                        "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                      }
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate block">
                          @{user.username}
                        </span>
                        {user.role === 'ADMIN' && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-sm">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        #{user.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. EMAIL & NGÀY THAM GIA */}
                <td className="py-3.5 px-4 align-top">
                  <span className="text-xs text-slate-700 block truncate">
                    {user.email || "Chưa cập nhật email"}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Ngày tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>

                {/* 3. HOẠT ĐỘNG MXH */}
                <td className="py-3.5 px-4 align-middle text-center">
                  <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <span title="Bài viết đã đăng">
                        📝 {user.metrics.postsCount}
                      </span>
                      <span title="Bạn bè">
                        👥 {user.metrics.friendsCount}
                      </span>
                    </div>
                    {user.metrics.violationsCount > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        ⚠️ {user.metrics.violationsCount} vi phạm
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. TRẠNG THÁI */}
                <td className="py-3.5 px-4 align-middle text-center">
                  {statusBadge(user)}
                </td>

                {/* 5. THAO TÁC */}
                <td className="py-3.5 px-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Profile */}
                    <button
                      onClick={() => onViewProfile(user)}
                      className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="Xem hồ sơ tóm tắt"
                    >
                      <i className="fas fa-id-card text-xs"></i>
                    </button>

                    {/* Lock / Unlock */}
                    {user.role !== 'ADMIN' && user.status !== 'DELETED' && (
                      user.status === 'LOCKED' ? (
                        <button
                          onClick={() => onUnlock(user)}
                          className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Mở khóa tài khoản"
                        >
                          <i className="fas fa-unlock text-xs"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenLock(user)}
                          className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Khóa tài khoản kỷ luật"
                        >
                          <i className="fas fa-lock text-xs"></i>
                        </button>
                      )
                    )}

                    {/* Soft Delete */}
                    {user.role !== 'ADMIN' && user.status !== 'DELETED' && (
                      <button
                        onClick={() => onDelete(user)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Xóa tài khoản (Biến thành bóng ma)"
                      >
                        <i className="fas fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
