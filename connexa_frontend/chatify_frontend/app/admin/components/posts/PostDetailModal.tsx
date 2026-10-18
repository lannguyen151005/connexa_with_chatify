"use client";

import React from 'react';
import { AdminPost } from './types';

interface PostDetailModalProps {
  post: AdminPost | null;
  onClose: () => void;
  onTogglePin: (post: AdminPost) => void;
  onToggleHide: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
  onNavigateReports?: () => void;
}

export default function PostDetailModal({
  post,
  onClose,
  onTogglePin,
  onToggleHide,
  onDelete,
  onNavigateReports,
}: PostDetailModalProps) {
  if (!post) return null;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg">
              #{post.id}
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Chi tiết Bài viết
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="fas fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Author Card & Meta */}
          <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  post.author.avatarUrl ||
                  "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                }
                alt={post.author.username}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    @{post.author.username}
                  </h4>
                  {post.author.role === 'ADMIN' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đăng lúc: {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                {post.visibility === 'PUBLIC' ? (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-globe text-slate-400"></i> Công khai
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <i className="fas fa-user-group text-slate-400"></i> Bạn bè
                  </span>
                )}
              </span>

              {post.isPinned && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <i className="fas fa-thumbtack text-amber-500"></i> Đang ghim
                </span>
              )}
            </div>
          </div>

          {/* Report Alert Banner (if any) */}
          {post.metrics.reportsCount > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-rose-800">
                <i className="fas fa-shield-halved text-rose-600 text-base shrink-0"></i>
                <div>
                  <span className="font-bold block">
                    Bài viết có {post.metrics.reportsCount} lượt báo cáo vi phạm
                  </span>
                  <span className="text-rose-600 text-[11px]">
                    Người dùng đã khiếu nại nội dung này với quản trị viên.
                  </span>
                </div>
              </div>
              {onNavigateReports && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateReports();
                  }}
                  className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                >
                  Xem Báo cáo
                </button>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Media Gallery */}
            {post.media.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {post.media.map((med, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video group"
                  >
                    {med.type === 'VIDEO' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <i className="fas fa-play text-2xl"></i>
                      </div>
                    ) : (
                      <img
                        src={med.url}
                        alt="Media attachment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Lượt thích</span>
              <span className="text-sm font-bold text-slate-700">
                ❤️ {post.metrics.likes.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Bình luận</span>
              <span className="text-sm font-bold text-slate-700">
                💬 {post.metrics.comments.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Chia sẻ</span>
              <span className="text-sm font-bold text-slate-700">
                🔄 {post.metrics.shares.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">Báo cáo</span>
              <span className={`text-sm font-bold ${post.metrics.reportsCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                🚩 {post.metrics.reportsCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Action: Toggle Pin */}
            <button
              onClick={() => onTogglePin(post)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                post.isPinned
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <i className="fas fa-thumbtack text-amber-500"></i>
              <span>{post.isPinned ? "Bỏ ghim" : "Ghim đầu Feed"}</span>
            </button>

            {/* Action: Toggle Hide */}
            <button
              onClick={() => onToggleHide(post)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                post.moderationStatus === 'HIDDEN'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <i className={`fas ${post.moderationStatus === 'HIDDEN' ? 'fa-eye text-emerald-600' : 'fa-eye-slash text-slate-500'}`}></i>
              <span>{post.moderationStatus === 'HIDDEN' ? "Hiện lại" : "Ẩn bài"}</span>
            </button>

            {/* Action: Soft Delete */}
            <button
              onClick={() => onDelete(post)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-trash-can"></i>
              <span>Xóa bài</span>
            </button>
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
