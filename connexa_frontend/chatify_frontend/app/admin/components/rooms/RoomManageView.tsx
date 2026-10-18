"use client";

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { AdminRoom, CloseRoomPayload, RoomFilterParams, RoomStatus, RoomType } from './types';
import { closeRoomApi, fetchRooms, isRoomMockEnabled, reopenRoomApi } from './roomService';
import RoomFilterBar from './RoomFilterBar';
import RoomTable from './RoomTable';
import RoomDetailModal from './RoomDetailModal';
import CloseRoomModal from './CloseRoomModal';

export default function RoomManageView() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    groupRooms: 0,
    directRooms: 0,
    totalMessages: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 6;

  const [search, setSearch] = useState('');
  const [type, setType] = useState<'ALL' | RoomType>('ALL');
  const [status, setStatus] = useState<'ALL' | RoomStatus>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<AdminRoom | null>(null);
  const [selectedRoomForClose, setSelectedRoomForClose] = useState<AdminRoom | null>(null);

  const isMock = isRoomMockEnabled();

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: RoomFilterParams = {
        search,
        type,
        status,
        page,
        pageSize,
      };
      const res = await fetchRooms(params);
      setRooms(res.rooms);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setStats(res.stats);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Không thể đồng bộ danh sách phòng chat từ Backend. Vui lòng kiểm tra dịch vụ Quarkus hoặc bật chế độ Mock."
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Handler for closing room
  const handleConfirmClose = async (roomId: string, payload: CloseRoomPayload) => {
    try {
      await closeRoomApi(roomId, payload);
      toast.success("Đã ghi nhận và đóng phòng chat thành công!");
      loadRooms();
      // Update modal if currently viewing this room
      if (selectedRoomForDetails && selectedRoomForDetails.id === roomId) {
        setSelectedRoomForDetails({
          ...selectedRoomForDetails,
          status: 'CLOSED',
          closedReasonCategory: payload.reasonCategory,
          closedReasonDetails: payload.reasonDetails,
          closedAt: new Date().toISOString(),
          closedBy: "Admin Quản trị",
        });
      }
    } catch (error) {
      toast.error("Lỗi khi đóng phòng chat!");
    }
  };

  // Handler for reopening room
  const handleReopen = async (room: AdminRoom) => {
    const confirm = await Swal.fire({
      title: "Mở lại phòng chat?",
      text: `Cho phép các thành viên trong "${room.title}" tiếp tục nhắn tin trò chuyện bình thường?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Mở lại",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#10b981",
    });

    if (confirm.isConfirmed) {
      try {
        await reopenRoomApi(room.id);
        toast.success(`Đã mở lại phòng chat "${room.title}"!`);
        loadRooms();
        if (selectedRoomForDetails && selectedRoomForDetails.id === room.id) {
          setSelectedRoomForDetails({
            ...selectedRoomForDetails,
            status: 'ACTIVE',
            closedReasonCategory: undefined,
            closedReasonDetails: undefined,
          });
        }
      } catch (error) {
        toast.error("Lỗi khi mở lại phòng chat!");
      }
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('ALL');
    setStatus('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Dev Mock Banner */}
      {isMock && (
        <div className="px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <i className="fas fa-flask text-amber-600"></i>
            <span>
              <strong>Chế độ Mock Data (Dev):</strong> Đang sử dụng dữ liệu mẫu cho module Phòng chat Chatify (NEXT_PUBLIC_ADMIN_ROOMS_MOCK=true).
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
            UI Prototype
          </span>
        </div>
      )}

      {/* Mini KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-comments"></i>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Tổng phòng chat
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {stats.totalRooms}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Nhóm trò chuyện
            </span>
            <span className="text-lg font-extrabold text-indigo-600">
              {stats.groupRooms}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-user-group"></i>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Cuộc trò chuyện 1-1
            </span>
            <span className="text-lg font-extrabold text-purple-600">
              {stats.directRooms}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-message"></i>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Tổng tin nhắn lưu trữ
            </span>
            <span className="text-lg font-extrabold text-emerald-600">
              {stats.totalMessages.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <RoomFilterBar
        search={search}
        type={type}
        status={status}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onTypeChange={(val) => {
          setType(val);
          setPage(1);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
        groupCount={stats.groupRooms}
        directCount={stats.directRooms}
      />

      {/* Main Content Areas: Loading, Error, Empty, or Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">
            Đang tải dữ liệu phòng chat Chatify...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-rose-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Không thể tải dữ liệu phòng chat
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {errorMessage}
          </p>
          <button
            onClick={loadRooms}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <i className="fas fa-rotate"></i>
            <span>Thử lại</span>
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-inbox"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Không tìm thấy phòng chat nào
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không có kết quả nào phù hợp với bộ lọc hiện tại. Thử thay đổi từ khóa hoặc đặt lại bộ lọc.
          </p>
          {(search || type !== 'ALL' || status !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table */}
          <RoomTable
            rooms={rooms}
            onViewDetails={(room) => setSelectedRoomForDetails(room)}
            onRequestClose={(room) => setSelectedRoomForClose(room)}
            onReopen={handleReopen}
          />

          {/* Pagination Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Hiển thị <strong>{rooms.length}</strong> trên tổng số <strong>{total}</strong> phòng chat
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer"
              >
                <i className="fas fa-chevron-left mr-1 text-[10px]"></i>
                Trước
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700">
                Trang {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer"
              >
                Sau
                <i className="fas fa-chevron-right ml-1 text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết & Danh sách thành viên */}
      <RoomDetailModal
        room={selectedRoomForDetails}
        onClose={() => setSelectedRoomForDetails(null)}
        onRequestCloseRoom={(room) => {
          setSelectedRoomForClose(room);
        }}
        onReopenRoom={handleReopen}
      />

      {/* Modal Đóng phòng chat với lý do bắt buộc */}
      <CloseRoomModal
        room={selectedRoomForClose}
        onClose={() => setSelectedRoomForClose(null)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
