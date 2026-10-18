"use client";

import React from 'react';
import { AdminRoom } from './types';

interface RoomDetailModalProps {
  room: AdminRoom | null;
  onClose: () => void;
  onRequestCloseRoom: (room: AdminRoom) => void;
  onReopenRoom: (room: AdminRoom) => void;
}

export default function RoomDetailModal({
  room,
  onClose,
  onRequestCloseRoom,
  onReopenRoom,
}: RoomDetailModalProps) {
  if (!room) return null;

  const isGroup = room.type === 'GROUP';
  const isClosed = room.status === 'CLOSED';

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              {room.avatarUrl ? (
                <img
                  src={room.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xs ${
                  isGroup ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  <i className={`fas ${isGroup ? 'fa-users' : 'fa-user-group'}`}></i>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  {room.title}
                </h3>
                {room.isProtected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <i className="fas fa-shield mr-1"></i>Hệ thống
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ID: <span className="font-mono text-slate-600">{room.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Nội dung cuộn bên trong */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5">
          {/* Cảnh báo nếu phòng ĐÃ ĐÓNG */}
          {isClosed && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <i className="fas fa-lock"></i>
                <span>Phòng chat này đang bị ĐÓNG / VÔ HIỆU HÓA</span>
              </div>
              <p className="text-rose-700">
                <span className="font-semibold">Lý do đóng:</span> {room.closedReasonCategory || "Vi phạm quy định"}
              </p>
              {room.closedReasonDetails && (
                <p className="text-rose-600">
                  <span className="font-semibold">Chi tiết:</span> {room.closedReasonDetails}
                </p>
              )}
              <div className="text-[11px] text-rose-500 pt-1 border-t border-rose-200/60 flex items-center justify-between">
                <span>Người thực hiện: {room.closedBy || "Admin"}</span>
                <span>Thời gian: {formatDateTime(room.closedAt)}</span>
              </div>
            </div>
          )}

          {/* Grid thông số nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Phân loại
              </span>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <i className={`fas ${isGroup ? 'fa-users text-blue-500' : 'fa-comments text-purple-500'}`}></i>
                {isGroup ? 'Nhóm trò chuyện' : 'Chat riêng 1-1'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Tổng thành viên
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {room.memberCount.toLocaleString()} người
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Tổng tin nhắn
              </span>
              <span className="text-sm font-extrabold text-blue-600">
                {room.messageCount.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Hoạt động cuối
              </span>
              <span className="text-xs font-bold text-slate-700">
                {formatDateTime(room.lastActiveAt)}
              </span>
            </div>
          </div>

          {/* Thông tin Người sáng lập */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={
                  room.creator.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    room.creator.fullName
                  )}&background=random`
                }
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {room.creator.fullName}
                </span>
                <span className="text-[11px] text-slate-400">
                  @{room.creator.username} • Người khởi tạo phòng
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400">
              Khởi tạo: {formatDateTime(room.createdAt)}
            </span>
          </div>

          {/* Danh sách thành viên */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-users-gear text-blue-500"></i>
                <span>Thành viên trong phòng ({room.members.length}/{room.memberCount})</span>
              </h4>
              <span className="text-[11px] text-slate-400 italic">
                * Chỉ hiển thị metadata và vai trò, bảo đảm riêng tư tin nhắn
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {room.members.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Không có danh sách thành viên chi tiết
                </div>
              ) : (
                room.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          member.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.fullName
                          )}&background=random`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {member.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          @{member.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Gia nhập: {formatDateTime(member.joinedAt)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          member.role === 'OWNER'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : member.role === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.role === 'OWNER'
                          ? 'Chủ phòng'
                          : member.role === 'ADMIN'
                          ? 'Quản trị'
                          : 'Thành viên'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>

          <div className="flex items-center gap-2">
            {isClosed ? (
              <button
                onClick={() => {
                  onClose();
                  onReopenRoom(room);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <i className="fas fa-lock-open text-xs"></i>
                <span>Mở lại phòng chat</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRequestCloseRoom(room);
                }}
                disabled={room.isProtected}
                className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
                  room.isProtected
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                }`}
              >
                <i className="fas fa-lock text-xs"></i>
                <span>Đóng phòng chat này</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
