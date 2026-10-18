import React, { useState } from 'react';
import { BOT_METADATA } from './types';

interface ChatbotHeaderProps {
  botName?: string;
  roleTitle?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  onClearChat: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  botName = BOT_METADATA.name,
  roleTitle = BOT_METADATA.roleTitle,
  avatarUrl = BOT_METADATA.avatarUrl,
  isOnline = true,
  onClearChat,
  onMinimize,
  onClose,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmClear = () => {
    setShowConfirm(true);
  };

  const handleExecuteClear = () => {
    setShowConfirm(false);
    onClearChat();
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#0369A1] to-[#3BBDF7] text-white rounded-t-2xl shadow-xs select-none">
      {/* Thông tin Bot */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/90 shadow-xs shrink-0">
          <img
            src={avatarUrl}
            alt={botName}
            className="w-full h-full object-cover"
          />
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"
              title="Đang hoạt động"
            />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold leading-4 tracking-tight drop-shadow-xs">
            {botName}
          </h3>
          <span className="text-[10px] text-sky-100 font-medium opacity-90">
            {roleTitle}
          </span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center gap-1">
        {/* Nút làm mới phiên chat */}
        <button
          type="button"
          onClick={handleConfirmClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-95 transition-all text-white/90 hover:text-white cursor-pointer"
          title="Làm mới cuộc trò chuyện"
          aria-label="Làm mới trò chuyện"
        >
          <i className="fa-classic fa-solid fa-rotate-right text-xs" aria-hidden="true" />
        </button>

        {/* Nút thu nhỏ */}
        <button
          type="button"
          onClick={onMinimize}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-95 transition-all text-white/90 hover:text-white cursor-pointer"
          title="Thu nhỏ cửa sổ"
          aria-label="Thu nhỏ"
        >
          <i className="fa-classic fa-solid fa-minus text-xs" aria-hidden="true" />
        </button>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-95 transition-all text-white/90 hover:text-white cursor-pointer"
          title="Đóng trợ lý"
          aria-label="Đóng"
        >
          <i className="fa-classic fa-solid fa-xmark text-sm" aria-hidden="true" />
        </button>
      </div>

      {/* Hộp thoại xác nhận làm mới cuộc trò chuyện thuần 100% Tailwind CSS */}
      {showConfirm && (
        <div className="absolute inset-x-2.5 top-12 z-50 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-sky-200 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-start gap-2.5">
            <div
              className="w-7 h-7 bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5"
              style={{ borderRadius: '9999px' }}
            >
              <i className="fa-classic fa-solid fa-rotate-right text-xs" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h4
                className="text-xs font-bold text-slate-900 !text-slate-900 leading-tight"
                style={{ color: '#0f172a' }}
              >
                Làm mới cuộc trò chuyện?
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Toàn bộ tin nhắn hiện tại sẽ được xóa và bắt đầu lại phiên mới.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleExecuteClear}
              className="px-3 py-1 text-xs font-semibold text-white bg-[#0369A1] hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
