import React from 'react';
import Swal from 'sweetalert2';
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
  const handleConfirmClear = () => {
    Swal.fire({
      title: 'Làm mới cuộc trò chuyện?',
      text: 'Toàn bộ tin nhắn hiện tại sẽ được xóa và bắt đầu lại phiên mới.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0369A1',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onClearChat();
      }
    });
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
    </div>
  );
};
