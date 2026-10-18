"use client";

import React from 'react';
import { AdminUser } from './types';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onOpenLock: (user: AdminUser) => void;
  onUnlock: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UserDetailModal({
  user,
  onClose,
  onOpenLock,
  onUnlock,
  onDelete,
}: UserDetailModalProps) {
  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg">
              #{user.id}
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Hồ sơ Thành viên
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="fas fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Main User Card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={user.avatarUrl || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"}
              alt={user.username}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900 truncate">
                  @{user.username}
                </h4>
                {user.role === 'ADMIN' && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              <span className="text-[11px] text-slate-400 block mt-1">
                Tham gia: {joinDate}
              </span>
            </div>
          </div>

          {/* Social Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Bài viết
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {user.metrics.postsCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Bạn bè
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {user.metrics.friendsCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vi phạm
              </span>
              <span className={`text-lg font-extrabold ${user.metrics.violationsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {user.metrics.violationsCount}
              </span>
            </div>
          </div>

          {/* Lock Info Banner (if currently locked) */}
          {user.status === 'LOCKED' && user.lockInfo && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-lock text-amber-600"></i>
                  Tài khoản đang bị khóa kỷ luật
                </span>
                <span className="text-[11px] font-normal text-amber-700">
                  {user.lockInfo.lockedUntil
                    ? `Hết hạn: ${new Date(user.lockInfo.lockedUntil).toLocaleDateString('vi-VN')}`
                    : 'Khóa vĩnh viễn'}
                </span>
              </div>
              <p className="text-amber-800">
                <strong>Lý do:</strong> "{user.lockInfo.reason}"
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onUnlock(user)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <i className="fas fa-unlock text-[10px]"></i>
                  <span>Mở khóa ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Deleted Banner */}
          {user.status === 'DELETED' && (
            <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
              Tài khoản này đã bị xóa (biến thành bóng ma) trong cơ sở dữ liệu.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user.role !== 'ADMIN' && user.status !== 'DELETED' && (
              <>
                {user.status === 'LOCKED' ? (
                  <button
                    onClick={() => onUnlock(user)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fas fa-unlock text-[11px]"></i>
                    <span>Mở khóa tài khoản</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenLock(user)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fas fa-lock text-[11px]"></i>
                    <span>Khóa tài khoản</span>
                  </button>
                )}

                <button
                  onClick={() => onDelete(user)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fas fa-trash-can text-[11px]"></i>
                  <span>Xóa tài khoản</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
