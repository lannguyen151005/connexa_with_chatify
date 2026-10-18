"use client";

import React from 'react';
import { AdminPost, PostModerationStatus } from './types';

interface PostTableProps {
  posts: AdminPost[];
  onViewDetail: (post: AdminPost) => void;
  onTogglePin: (post: AdminPost) => void;
  onToggleHide: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
  onNavigateReports?: () => void;
}

export default function PostTable({
  posts,
  onViewDetail,
  onTogglePin,
  onToggleHide,
  onDelete,
  onNavigateReports,
}: PostTableProps) {
  const statusBadge = (status: PostModerationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đang hiển thị
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Bị báo cáo
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Đã ẩn
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
              <th className="py-3.5 px-4 w-[220px]">Tác giả</th>
              <th className="py-3.5 px-4">Nội dung & Media</th>
              <th className="py-3.5 px-4 w-[160px] text-center">Tương tác</th>
              <th className="py-3.5 px-4 w-[150px] text-center">Trạng thái</th>
              <th className="py-3.5 px-4 w-[140px] text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. TÁC GIẢ */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={
                        post.author.avatarUrl ||
                        "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                      }
                      alt={post.author.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate block">
                          @{post.author.username}
                        </span>
                        {post.author.role === 'ADMIN' && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-sm">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. NỘI DUNG & MEDIA */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-start gap-3">
                    {/* Media Thumbnail (if exists) */}
                    {post.media.length > 0 && (
                      <div
                        onClick={() => onViewDetail(post)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 cursor-pointer group-hover:opacity-90"
                      >
                        {post.media[0].type === 'VIDEO' ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-xs">
                            <i className="fas fa-play"></i>
                          </div>
                        ) : (
                          <img
                            src={post.media[0].url}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {post.media.length > 1 && (
                          <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-tl-sm">
                            +{post.media.length - 1}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Text Snippet */}
                    <div className="min-w-0 flex-1">
                      <p
                        onClick={() => onViewDetail(post)}
                        className="text-xs text-slate-700 line-clamp-2 leading-relaxed cursor-pointer hover:text-blue-600 transition-colors"
                        title={post.content}
                      >
                        {post.content}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {post.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {post.visibility === 'PUBLIC' ? 'Công khai' : 'Bạn bè'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 3. TƯƠNG TÁC */}
                <td className="py-3.5 px-4 align-middle text-center">
                  <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-3">
                      <span title="Lượt thích">
                        ❤️ {post.metrics.likes}
                      </span>
                      <span title="Bình luận">
                        💬 {post.metrics.comments}
                      </span>
                    </div>

                    {post.metrics.reportsCount > 0 && (
                      <button
                        onClick={onNavigateReports}
                        className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Xem các báo cáo vi phạm liên quan"
                      >
                        <i className="fas fa-flag text-[9px]"></i>
                        <span>{post.metrics.reportsCount} báo cáo</span>
                      </button>
                    )}
                  </div>
                </td>

                {/* 4. TRẠNG THÁI & GHIM */}
                <td className="py-3.5 px-4 align-middle text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    {statusBadge(post.moderationStatus)}
                    {post.isPinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <i className="fas fa-thumbtack text-amber-500 text-[9px]"></i>
                        Đã ghim
                      </span>
                    )}
                  </div>
                </td>

                {/* 5. HÀNH ĐỘNG NHANH */}
                <td className="py-3.5 px-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Detail */}
                    <button
                      onClick={() => onViewDetail(post)}
                      className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="Xem chi tiết bài viết"
                    >
                      <i className="fas fa-eye text-xs"></i>
                    </button>

                    {/* Pin / Unpin */}
                    <button
                      onClick={() => onTogglePin(post)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                        post.isPinned
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title={post.isPinned ? "Bỏ ghim bài viết" : "Ghim bài lên đầu Feed"}
                    >
                      <i className="fas fa-thumbtack text-xs"></i>
                    </button>

                    {/* Hide / Unhide */}
                    <button
                      onClick={() => onToggleHide(post)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                        post.moderationStatus === 'HIDDEN'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                      }`}
                      title={post.moderationStatus === 'HIDDEN' ? "Hiện lại bài viết" : "Ẩn bài viết"}
                    >
                      <i className={`fas ${post.moderationStatus === 'HIDDEN' ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                    </button>

                    {/* Soft Delete */}
                    <button
                      onClick={() => onDelete(post)}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="Xóa bài viết (Xóa mềm)"
                    >
                      <i className="fas fa-trash-can text-xs"></i>
                    </button>
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
