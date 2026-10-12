'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IChatMessage, BOT_METADATA } from './types';
import { mockGenerateReply } from './chatbotMockService';
import { ChatbotWindow } from './ChatbotWindow';

const STORAGE_KEY_PREFIX = 'connexa_charles_chat_';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Lấy key storage theo user đăng nhập (nếu có)
  const getStorageKey = useCallback((): string => {
    if (typeof window === 'undefined') return `${STORAGE_KEY_PREFIX}guest`;
    const userId = localStorage.getItem('user_id') || 'guest';
    return `${STORAGE_KEY_PREFIX}${userId}`;
  }, []);

  // 1. Khởi tạo đọc lịch sử từ localStorage ở client-side
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // Bỏ qua nếu dữ liệu storage bị lỗi
    }
  }, [getStorageKey]);

  // 2. Tự động lưu tin nhắn vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    } catch {
      // Tránh crash nếu storage đầy
    }
  }, [messages, isMounted, getStorageKey]);

  // 3. Xử lý gửi tin nhắn và nhận phản hồi
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Sinh ID duy nhất
    const userMsgId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `msg_${Date.now()}_u`;

    const userMessage: IChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: trimmed,
      timestamp: Date.now(),
      status: 'success',
    };

    // Đẩy tin nhắn người dùng vào danh sách
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Gọi service giả lập (sau này thay bằng API thật)
      const replyContent = await mockGenerateReply(trimmed, 900);

      const botMsgId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `msg_${Date.now()}_b`;

      const botMessage: IChatMessage = {
        id: botMsgId,
        sender: 'bot',
        content: replyContent,
        timestamp: Date.now(),
        status: 'success',
      };

      setMessages((prev) => [...prev, botMessage]);

      // Nếu cửa sổ đang đóng/thu nhỏ, bật cờ thông báo tin mới
      if (!isOpen || isMinimized) {
        setHasUnread(true);
      }
    } catch {
      toast.error('Có lỗi xảy ra khi kết nối với Trợ lý Charles');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Xóa lịch sử cuộc trò chuyện
  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem(getStorageKey());
      toast.success('Đã làm mới cuộc trò chuyện!');
    } catch {
      // Bỏ qua lỗi storage
    }
  };

  // 5. Đóng / Mở cửa sổ
  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasUnread(false);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  // 6. Thu nhỏ
  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  // 7. Đóng
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Tránh render SSR không khớp với client state
  if (!isMounted) return null;

  return (
    <>
      {/* Cửa sổ Popup Chat */}
      <ChatbotWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        onMinimize={handleMinimize}
        onClose={handleClose}
      />

      {/* Nút nổi Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-4 sm:right-6 z-[1035] w-14 h-14 rounded-full bg-gradient-to-tr from-[#0369A1] to-[#4F46E5] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none group border-2 border-white/80"
        title={isOpen ? 'Đóng Trợ lý Charles' : `${BOT_METADATA.name} (${BOT_METADATA.roleTitle})`}
        aria-label={isOpen ? 'Đóng Trợ lý Charles' : 'Mở Trợ lý Charles'}
      >
        {/* Icon chính */}
        {isOpen && !isMinimized ? (
          <i className="fa-classic fa-solid fa-xmark text-xl transition-transform group-hover:rotate-90 duration-200" aria-hidden="true" />
        ) : (
          <i className="fa-classic fa-solid fa-robot text-xl transition-transform group-hover:scale-110 duration-200" aria-hidden="true" />
        )}

        {/* Chấm trạng thái Online */}
        <span
          className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
          title="Online"
        />

        {/* Huy hiệu tin nhắn mới chưa đọc */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -left-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white" />
          </span>
        )}
      </button>
    </>
  );
};

export default ChatbotWidget;
