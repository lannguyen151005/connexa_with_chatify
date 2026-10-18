"use client";

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { AdminUser, PaginatedUsersResponse, UserFilterParams, UserLockDuration } from './types';
import {
  deleteUserApi,
  fetchAdminUsers,
  isUsersMockEnabled,
  lockUserApi,
  unlockUserApi,
} from './userService';
import UserFilterBar from './UserFilterBar';
import UserTable from './UserTable';
import UserLockModal from './UserLockModal';
import UserDetailModal from './UserDetailModal';

export default function UserManageView() {
  const [data, setData] = useState<PaginatedUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedProfileUser, setSelectedProfileUser] = useState<AdminUser | null>(null);
  const [selectedLockUser, setSelectedLockUser] = useState<AdminUser | null>(null);

  const [filterParams, setFilterParams] = useState<UserFilterParams>({
    page: 0,
    size: 6,
    status: 'ALL',
    role: 'ALL',
    keyword: '',
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchAdminUsers(filterParams);
      setData(res);
    } catch (err: any) {
      console.error("Lỗi tải danh sách người dùng:", err);
      // Khi không bật mock: hiện lỗi thật, không tự ý nạp mock data
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến API Backend Quarkus (/api/admin/users/list)."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (newParams: Partial<UserFilterParams>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Hành động: Khóa tài khoản
  const handleLockUser = async (
    user: AdminUser,
    duration: UserLockDuration,
    reason: string
  ) => {
    try {
      const updated = await lockUserApi(user.id, { duration, reason });
      if (updated) {
        toast.success(`Đã thi hành khóa tài khoản @${user.username}!`);
        setSelectedLockUser(null);
        if (selectedProfileUser && selectedProfileUser.id === user.id) {
          setSelectedProfileUser(updated);
        }
        loadUsers();
      }
    } catch (error) {
      toast.error("Lỗi khi khóa tài khoản!");
    }
  };

  // Hành động: Mở khóa tài khoản
  const handleUnlockUser = async (user: AdminUser) => {
    const result = await Swal.fire({
      title: 'Mở khóa tài khoản?',
      text: `Cho phép @${user.username} đăng nhập và hoạt động bình thường trở lại.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý mở khóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
        cancelButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
      },
    });

    if (result.isConfirmed) {
      try {
        const updated = await unlockUserApi(user.id);
        if (updated) {
          toast.success(`Đã mở khóa tài khoản @${user.username}!`);
          if (selectedProfileUser && selectedProfileUser.id === user.id) {
            setSelectedProfileUser(updated);
          }
          loadUsers();
        }
      } catch (error) {
        toast.error("Lỗi khi mở khóa tài khoản!");
      }
    }
  };

  // Hành động: Xóa tài khoản (Kế thừa logic cũ của dự án)
  const handleDeleteUser = async (user: AdminUser) => {
    if (user.username === "Người dùng đã xóa") {
      toast.error("Người dùng này đã bị xóa từ trước rồi!");
      return;
    }

    const result = await Swal.fire({
      title: 'Xóa tài khoản?',
      text: `Bạn có chắc muốn biến @${user.username} thành bóng ma không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
        cancelButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
      },
    });

    if (result.isConfirmed) {
      try {
        const ok = await deleteUserApi(user.id);
        if (ok) {
          toast.success(`Đã xóa tài khoản thành công!`);
          setSelectedProfileUser(null);
          loadUsers();
        }
      } catch (error) {
        toast.error("Thao tác thất bại!");
      }
    }
  };

  const isMock = isUsersMockEnabled();

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* 1. DEV MOCK BANNER */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-800">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <i className="fas fa-users-gear"></i>
            </span>
            <div>
              <p className="font-bold text-amber-900 leading-snug">
                Chế độ Dữ liệu Mẫu Quản lý Người dùng (Dev Mock Mode)
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Dữ liệu mô phỏng thành viên (Hoạt động, Bị khóa, Đã xóa). Thao tác khóa/mở khóa/xóa được phản ánh tại chỗ.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto border border-amber-200">
            NEXT_PUBLIC_ADMIN_USERS_MOCK=true
          </span>
        </div>
      )}

      {/* 2. HEADER TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Quản lý Người dùng
            </h2>
            {isMock && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm soát danh sách thành viên, thẩm định vi phạm và áp dụng chế tài kỷ luật
          </p>
        </div>

        {data && (
          <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto">
            Tổng cộng: <strong className="text-slate-900">{data.totalElements.toLocaleString()}</strong> tài khoản
          </div>
        )}
      </div>

      {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
      <UserFilterBar
        filterParams={filterParams}
        onFilterChange={handleFilterChange}
        onRefresh={loadUsers}
        isLoading={isLoading}
      />

      {/* 4. VÙNG DỮ LIỆU CHÍNH */}

      {/* 4.1 TRẠNG THÁI LOADING */}
      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center bg-white rounded-2xl border border-slate-200/80 p-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-slate-700">Đang tải danh sách thành viên...</p>
          <span className="text-xs text-slate-400 mt-1">
            {isMock ? "Đang chuẩn bị dữ liệu mô phỏng..." : "Đang kết nối Backend Quarkus..."}
          </span>
        </div>
      )}

      {/* 4.2 TRẠNG THÁI LỖI */}
      {errorMessage && !data && (
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xs max-w-2xl mx-auto text-center my-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Lỗi kết nối API Quản lý Người dùng
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100 font-mono text-left">
            {errorMessage}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Cờ `NEXT_PUBLIC_ADMIN_USERS_MOCK=false`. Hệ thống đang chờ kết nối Backend thật.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadUsers}
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
            <i className="fas fa-user-slash"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Không tìm thấy người dùng nào
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Không có thành viên nào phù hợp với từ khóa hoặc bộ lọc đã chọn.
          </p>
          <button
            onClick={() => handleFilterChange({ keyword: '', status: 'ALL', role: 'ALL', page: 0 })}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* 4.4 TRẠNG THÁI THÀNH CÔNG: BẢNG DỮ LIỆU */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          <UserTable
            users={data.items}
            onViewProfile={(u) => setSelectedProfileUser(u)}
            onOpenLock={(u) => setSelectedLockUser(u)}
            onUnlock={handleUnlockUser}
            onDelete={handleDeleteUser}
          />

          {/* Phân trang */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{data.page * data.size + 1}</strong> -{' '}
              <strong className="text-slate-800">
                {Math.min((data.page + 1) * data.size, data.totalElements)}
              </strong>{' '}
              trên tổng số <strong className="text-slate-800">{data.totalElements}</strong> tài khoản
            </span>

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

      {/* 5. MODAL KHÓA TÀI KHOẢN KỶ LUẬT */}
      {selectedLockUser && (
        <UserLockModal
          user={selectedLockUser}
          onClose={() => setSelectedLockUser(null)}
          onLock={handleLockUser}
        />
      )}

      {/* 6. MODAL XEM HỒ SƠ TÓM TẮT THÀNH VIÊN */}
      {selectedProfileUser && (
        <UserDetailModal
          user={selectedProfileUser}
          onClose={() => setSelectedProfileUser(null)}
          onOpenLock={(u) => setSelectedLockUser(u)}
          onUnlock={handleUnlockUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}
