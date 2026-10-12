import React from 'react';
import { IChatMessage } from './types';
import { ChatbotHeader } from './ChatbotHeader';
import { QuickPromptChips } from './QuickPromptChips';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputArea } from './ChatInputArea';

interface ChatbotWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  messages: IChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  isOpen,
  isMinimized,
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  onMinimize,
  onClose,
}) => {
  if (!isOpen) return null;

  // Khi đang ở chế độ thu nhỏ: Chỉ hiển thị một thanh ngang nhỏ gọn
  if (isMinimized) {
    return (
      <div className="fixed bottom-22 right-4 sm:right-6 z-[1035] bg-gradient-to-r from-[#0369A1] to-[#3BBDF7] text-white px-4 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-3 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <i className="fa-classic fa-solid fa-robot" aria-hidden="true" />
          <span>Trợ lý Charles</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all cursor-pointer"
            title="Mở lại cửa sổ chat"
            aria-label="Mở lại cửa sổ chat"
          >
            <i className="fa-classic fa-solid fa-up-right-and-down-left-from-center text-[10px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all cursor-pointer"
            title="Đóng trợ lý"
            aria-label="Đóng"
          >
            <i className="fa-classic fa-solid fa-xmark text-xs" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Khung popup đầy đủ
  return (
    <div
      className="fixed bottom-22 right-3 sm:right-6 z-[1035] w-[calc(100vw-1.5rem)] sm:w-[390px] h-[550px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden select-text animate-in fade-in slide-in-from-bottom-3 duration-200"
      role="dialog"
      aria-label="Cửa sổ trò chuyện với Trợ lý Charles"
    >
      {/* 1. Header */}
      <ChatbotHeader
        onClearChat={onClearChat}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      {/* 2. Thẻ gợi ý câu hỏi nhanh (Quick Prompts) */}
      <QuickPromptChips
        onSelectPrompt={onSendMessage}
        disabled={isLoading}
      />

      {/* 3. Danh sách tin nhắn & Typing Indicator */}
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
      />

      {/* 4. Thanh nhập nội dung */}
      <ChatInputArea
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
