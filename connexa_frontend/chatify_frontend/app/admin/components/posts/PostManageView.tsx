"use client";

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { AdminPost, PaginatedPostsResponse, PostFilterParams } from './types';
import {
  fetchAdminPosts,
  isPostsMockEnabled,
  softDeletePostApi,
  togglePinPostApi,
  updatePostModerationStatusApi,
} from './postService';
import PostFilterBar from './PostFilterBar';
import PostTable from './PostTable';
import PostDetailModal from './PostDetailModal';
import { AdminMenuTab } from '../../types';

interface PostManageViewProps {
  onNavigateTab?: (tab: AdminMenuTab) => void;
}

export default function PostManageView({ onNavigateTab }: PostManageViewProps) {
  const [data, setData] = useState<PaginatedPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  const [filterParams, setFilterParams] = useState<PostFilterParams>({
    page: 0,
    size: 6,
    keyword: '',
    status: 'ALL',
    pinnedOnly: false,
  });

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchAdminPosts(filterParams);
      setData(res);
    } catch (err: any) {
      console.error("Lỗi tải bài viết:", err);
      // Khi không bật mock: hiện lỗi thật, không tự ý nạp mock data
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến API Backend Quarkus (/api/admin/posts)."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleFilterChange = (newParams: Partial<PostFilterParams>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Hành động: Ghim / Bỏ ghim bài viết
  const handleTogglePin = async (post: AdminPost) => {
    const nextPinState = !post.isPinned;
    try {
      const updated = await togglePinPostApi(post.id, nextPinState);
      if (updated) {
        toast.success(
          nextPinState
            ? `Đã ghim bài viết #${post.id} lên đầu Bảng tin!`
            : `Đã bỏ ghim bài viết #${post.id}!`
        );
        // Cập nhật state trực tiếp
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((p) => (p.id === post.id ? { ...p, isPinned: nextPinState } : p)),
          };
        });
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost((prev) => (prev ? { ...prev, isPinned: nextPinState } : null));
        }
      }
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái ghim bài viết!");
    }
  };

  // Hành động: Ẩn / Hiện bài viết
  const handleToggleHide = async (post: AdminPost) => {
    const nextStatus = post.moderationStatus === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
    try {
      const updated = await updatePostModerationStatusApi(post.id, nextStatus);
      if (updated) {
        toast.success(
          nextStatus === 'HIDDEN'
            ? `Đã ẩn bài viết #${post.id} khỏi Bảng tin!`
            : `Đã cho phép hiển thị lại bài viết #${post.id}!`
        );
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((p) => (p.id === post.id ? { ...p, moderationStatus: nextStatus } : p)),
          };
        });
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost((prev) => (prev ? { ...prev, moderationStatus: nextStatus } : null));
        }
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái kiểm duyệt!");
    }
  };

  // Hành động: Xóa mềm bài viết (Soft delete)
  const handleDeletePost = async (post: AdminPost) => {
    const result = await Swal.fire({
      title: 'Xóa bài viết vi phạm?',
      text: `Bài viết #${post.id} của @${post.author.username} sẽ được gỡ khỏi Newsfeed và lưu vào danh sách xóa mềm.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
        cancelButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
      },
    });

    if (result.isConfirmed) {
      try {
        const ok = await softDeletePostApi(post.id);
        if (ok) {
          toast.success("Đã xóa bài viết thành công!");
          setSelectedPost(null);
          // Tải lại trang hiện tại
          loadPosts();
        }
      } catch (error) {
        toast.error("Lỗi khi xóa bài viết!");
      }
    }
  };

  const handleNavigateReports = () => {
    if (onNavigateTab) {
      onNavigateTab('REPORTS');
    }
  };

  const isMock = isPostsMockEnabled();

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* 1. DEV MOCK BANNER */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-800">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <i className="fas fa-newspaper"></i>
            </span>
            <div>
              <p className="font-bold text-amber-900 leading-snug">
                Chế độ Dữ liệu Mẫu Quản lý Bài viết (Dev Mock Mode)
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Dữ liệu mô phỏng bài viết (ảnh, ghim, báo cáo) phục vụ thiết kế UI. Thay đổi thao tác được mô phỏng tại chỗ.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto border border-amber-200">
            NEXT_PUBLIC_ADMIN_POSTS_MOCK=true
          </span>
        </div>
      )}

      {/* 2. HEADER TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Quản lý Bài viết & Nội dung
            </h2>
            {isMock && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm duyệt bài đăng trên Bảng tin, ghim thông báo và xử lý nội dung vi phạm
          </p>
        </div>

        {data && (
          <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto">
            Tổng cộng: <strong className="text-slate-900">{data.totalElements.toLocaleString()}</strong> bài viết
          </div>
        )}
      </div>

      {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
      <PostFilterBar
        filterParams={filterParams}
        onFilterChange={handleFilterChange}
        onRefresh={loadPosts}
        isLoading={isLoading}
      />

      {/* 4. VÙNG DỮ LIỆU CHÍNH (4 TRẠNG THÁI) */}

      {/* 4.1 TRẠNG THÁI LOADING */}
      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center bg-white rounded-2xl border border-slate-200/80 p-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-slate-700">Đang tải danh sách bài viết...</p>
          <span className="text-xs text-slate-400 mt-1">
            {isMock ? "Đang chuẩn bị dữ liệu mô phỏng..." : "Đang truy vấn Backend Quarkus..."}
          </span>
        </div>
      )}

      {/* 4.2 TRẠNG THÁI LỖI (KHI TẮT MOCK VÀ API THẤT BẠI) */}
      {errorMessage && !data && (
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xs max-w-2xl mx-auto text-center my-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Lỗi kết nối API Quản lý Bài viết
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100 font-mono text-left">
            {errorMessage}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Cờ `NEXT_PUBLIC_ADMIN_POSTS_MOCK=false`. Hệ thống đang chờ kết nối Backend thật.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadPosts}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <i className="fas fa-rotate-right"></i>
              Thử lại kết nối
            </button>
          </div>
        </div>
      )}

      {/* 4.3 TRẠNG THÁI DANH SÁCH RỖNG */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fas fa-newspaper"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Không tìm thấy bài viết nào
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Không có bài viết nào phù hợp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
          </p>
          <button
            onClick={() => handleFilterChange({ keyword: '', status: 'ALL', pinnedOnly: false, page: 0 })}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* 4.4 TRẠNG THÁI THÀNH CÔNG: BẢNG DỮ LIỆU */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          <PostTable
            posts={data.items}
            onViewDetail={(post) => setSelectedPost(post)}
            onTogglePin={handleTogglePin}
            onToggleHide={handleToggleHide}
            onDelete={handleDeletePost}
            onNavigateReports={handleNavigateReports}
          />

          {/* THANH PHÂN TRANG */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{data.page * data.size + 1}</strong> -{' '}
              <strong className="text-slate-800">
                {Math.min((data.page + 1) * data.size, data.totalElements)}
              </strong>{' '}
              trên tổng số <strong className="text-slate-800">{data.totalElements}</strong> bài viết
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                disabled={data.page === 0}
                onClick={() => handleFilterChange({ page: data.page - 1 })}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <i className="fas fa-chevron-left text-[10px]"></i>
                <span className="hidden sm:inline">Trước</span>
              </button>

              <div className="flex items-center gap-1 px-2 font-bold text-slate-700">
                <span>{data.page + 1}</span>
                <span className="text-slate-400">/</span>
                <span>{data.totalPages}</span>
              </div>

              <button
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => handleFilterChange({ page: data.page + 1 })}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="hidden sm:inline">Sau</span>
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL XEM CHI TIẾT BÀI VIẾT */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onTogglePin={handleTogglePin}
          onToggleHide={handleToggleHide}
          onDelete={handleDeletePost}
          onNavigateReports={handleNavigateReports}
        />
      )}
    </div>
  );
}
