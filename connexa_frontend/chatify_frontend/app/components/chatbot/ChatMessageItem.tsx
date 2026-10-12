import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { IChatMessage } from './types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageItemProps {
  message: IChatMessage;
  botAvatarUrl: string;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, botAvatarUrl }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const formatTime = (ts: number): string => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Đã sao chép caption vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép văn bản');
    }
  };

  // 1. Bong bóng User
  if (isUser) {
    return (
      <div className="flex flex-col items-end mb-3.5 pl-8">
        <div className="max-w-[85%] bg-[#0369A1] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 mr-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    );
  }

  // 2. Bong bóng Bot
  return (
    <div className="flex items-start gap-2 mb-3.5 pr-6 group">
      {/* Avatar Bot */}
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-sky-200 shadow-xs">
        <img
          src={botAvatarUrl}
          alt="Charles Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col max-w-[88%]">
        {/* Nội dung tin nhắn Bot */}
        <div className="bg-gray-100 text-gray-900 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-gray-200/60">
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Thanh công cụ phụ: thời gian + nút Copy caption */}
        <div className="flex items-center gap-2 mt-1 ml-1 text-[11px] text-gray-400">
          <span>{formatTime(message.timestamp)}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-sky-700 transition-colors cursor-pointer select-none py-0.5 px-1.5 rounded hover:bg-gray-100"
            title="Sao chép nội dung để đăng bài"
          >
            <i
              className={`fa-classic fa-solid ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}
              aria-hidden="true"
            />
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
