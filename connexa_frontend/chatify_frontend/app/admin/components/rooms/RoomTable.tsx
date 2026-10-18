"use client";

import React from 'react';
import { AdminRoom } from './types';

interface RoomTableProps {
  rooms: AdminRoom[];
  onViewDetails: (room: AdminRoom) => void;
  onRequestClose: (room: AdminRoom) => void;
  onReopen: (room: AdminRoom) => void;
}

export default function RoomTable({
  rooms,
  onViewDetails,
  onRequestClose,
  onReopen,
}: RoomTableProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 md:px-5">Phòng / Cuộc trò chuyện</th>
              <th className="py-3.5 px-4">Người sáng lập</th>
              <th className="py-3.5 px-4 text-center">Thành viên</th>
              <th className="py-3.5 px-4">Tin nhắn & Hoạt động</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 md:px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rooms.map((room) => {
              const isGroup = room.type === 'GROUP';
              const isClosed = room.status === 'CLOSED';

              return (
                <tr
                  key={room.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Cột 1: Thông tin phòng chat */}
                  <td className="py-4 px-4 md:px-5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {room.avatarUrl ? (
                          <img
                            src={room.avatarUrl}
                            alt=""
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold shadow-2xs ${
                            isGroup ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            <i className={`fas ${isGroup ? 'fa-users' : 'fa-user-group'}`}></i>
                          </div>
                        )}

                        {/* Status Dot */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isClosed ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      {/* Title & Badges */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-sm truncate max-w-[220px] md:max-w-[280px]">
                            {room.title}
                          </h4>
                          {room.isProtected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                              <i className="fas fa-shield mr-1"></i>Hệ thống
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isGroup
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                            }`}
                          >
                            <i className={`fas ${isGroup ? 'fa-users' : 'fa-comments'} mr-1 text-[9px]`}></i>
                            {isGroup ? 'Nhóm' : 'Chat 1-1'}
                          </span>
                          <span className="text-xs text-slate-400">
                            Tạo: {formatTime(room.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Người sáng lập */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          room.creator.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            room.creator.fullName
                          )}&background=random`
                        }
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-800 block truncate max-w-[130px]">
                          {room.creator.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[130px]">
                          @{room.creator.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Số thành viên */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onViewDetails(room)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 transition-all cursor-pointer text-xs font-semibold"
                    >
                      <i className="fas fa-users text-slate-400 text-[11px]"></i>
                      <span>{room.memberCount.toLocaleString()}</span>
                      <i className="fas fa-chevron-right text-[9px] text-slate-400"></i>
                    </button>
                  </td>

                  {/* Cột 4: Tin nhắn & Hoạt động */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <i className="fas fa-message text-slate-400 text-[10px]"></i>
                        <span>{room.messageCount.toLocaleString()} tin nhắn</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <i className="fas fa-clock text-[9px]"></i>
                        <span>Gần nhất: {formatTime(room.lastActiveAt)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="py-4 px-4 text-center">
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Đã đóng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Hoạt động
                      </span>
                    )}
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="py-4 px-4 md:px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Nút Xem chi tiết */}
                      <button
                        onClick={() => onViewDetails(room)}
                        title="Xem thông tin và thành viên"
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <i className="fas fa-eye text-xs"></i>
                        <span className="hidden sm:inline">Chi tiết</span>
                      </button>

                      {/* Nút Đóng / Mở lại phòng */}
                      {isClosed ? (
                        <button
                          onClick={() => onReopen(room)}
                          title="Mở lại phòng chat này"
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <i className="fas fa-lock-open text-xs"></i>
                          <span className="hidden sm:inline">Mở lại</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRequestClose(room)}
                          disabled={room.isProtected}
                          title={
                            room.isProtected
                              ? "Phòng hệ thống được bảo vệ, không thể đóng"
                              : "Đóng phòng theo lý do vi phạm/quy định"
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                            room.isProtected
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer'
                          }`}
                        >
                          <i className="fas fa-lock text-xs"></i>
                          <span className="hidden sm:inline">Đóng phòng</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
