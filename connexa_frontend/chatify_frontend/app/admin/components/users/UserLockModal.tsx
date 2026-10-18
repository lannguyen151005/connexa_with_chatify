"use client";

import React, { useState } from 'react';
import { AdminUser, UserLockDuration } from './types';

interface UserLockModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onLock: (user: AdminUser, duration: UserLockDuration, reason: string) => void;
}

export default function UserLockModal({ user, onClose, onLock }: UserLockModalProps) {
  const [duration, setDuration] = useState<UserLockDuration>(7);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onLock(user, duration, reason);
    setIsSubmitting(false);
  };

  const durationOptions: { value: UserLockDuration; label: string; desc: string }[] = [
    { value: 3, label: "3 ngày", desc: "Vi phạm lần đầu / Spam nhẹ" },
    { value: 7, label: "7 ngày", desc: "Tái phạm ngôn từ thù địch / Khiêu khích" },
    { value: 30, label: "30 ngày", desc: "Vi phạm nghiêm trọng / Đe dọa an toàn" },
    { value: 'PERMANENT', label: "Khóa vĩnh viễn", desc: "Lừa đảo chiếm đoạt / Phá hoại hệ thống" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 border border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Khóa Tài khoản Kỷ luật
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <i className="fas fa-xmark text-sm"></i>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* User Info Strip */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <img
                src={user.avatarUrl || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  @{user.username}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                {user.metrics.violationsCount} lần vi phạm
              </span>
            </div>

            {/* Select Duration */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Chọn thời hạn khóa tài khoản:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {durationOptions.map((opt) => (
                  <label
                    key={String(opt.value)}
                    onClick={() => setDuration(opt.value)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      duration === opt.value
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-800">
                        {opt.label}
                      </span>
                      <input
                        type="radio"
                        name="lockDuration"
                        checked={duration === opt.value}
                        onChange={() => setDuration(opt.value)}
                        className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {opt.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Lý do khóa tài khoản:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Đăng bài viết lừa đảo và liên tục xúc phạm người khác..."
                rows={2}
                required
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <i className="fas fa-lock text-[10px]"></i>
              <span>Thi hành kỷ luật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
