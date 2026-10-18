"use client";

import React, { useState } from 'react';
import { AdminRoom, CloseRoomPayload } from './types';

interface CloseRoomModalProps {
  room: AdminRoom | null;
  onClose: () => void;
  onConfirm: (roomId: string, payload: CloseRoomPayload) => Promise<void>;
}

const REASON_CATEGORIES = [
  "Vi phạm Tiêu chuẩn Cộng đồng",
  "Spam & Phát tán tin nhắn rác",
  "Nội dung phản cảm hoặc độc hại",
  "Phát tán liên kết lừa đảo mạo danh",
  "Theo yêu cầu của Quản trị nhóm / Thành viên",
  "Lý do khác",
];

export default function CloseRoomModal({
  room,
  onClose,
  onConfirm,
}: CloseRoomModalProps) {
  const [category, setCategory] = useState(REASON_CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setIsSubmitting(true);
    try {
      await onConfirm(room.id, {
        reasonCategory: category,
        reasonDetails: details.trim() || category,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-sm">
              <i className="fas fa-lock"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Xác nhận Đóng / Vô hiệu hóa phòng
              </h3>
              <p className="text-xs text-slate-500">
                Lưu vết lý do xử lý vào nhật ký kiểm duyệt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
          {/* Tóm tắt phòng */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                <i className={`fas ${room.type === 'GROUP' ? 'fa-users' : 'fa-comments'}`}></i>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {room.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {room.type === 'GROUP' ? 'Nhóm trò chuyện' : 'Chat 1-1'} • {room.memberCount} thành viên
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
              {room.messageCount} tin nhắn
            </span>
          </div>

          {/* Cảnh báo tác động */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
            <i className="fas fa-triangle-exclamation text-amber-600 mt-0.5 shrink-0"></i>
            <p>
              Việc đóng phòng sẽ tạm ngưng quyền gửi tin nhắn mới của tất cả thành viên. Dữ liệu tin nhắn cũ được lưu trữ phục vụ đối chiếu, không xóa cứng trực tiếp.
            </p>
          </div>

          {/* Chọn Lý do xử lý */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Phân loại lý do xử lý <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              required
            >
              {REASON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ghi chú chi tiết */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Ghi chú chi tiết cho biên bản xử lý
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Nhập mô tả cụ thể về hành vi vi phạm, bằng chứng hoặc yêu cầu xử lý..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-lock text-xs"></i>
                  <span>Xác nhận Đóng phòng</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
