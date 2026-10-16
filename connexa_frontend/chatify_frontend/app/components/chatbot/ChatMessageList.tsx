import React, { useEffect, useRef } from 'react';
import { IChatMessage, BOT_METADATA, DEFAULT_QUICK_PROMPTS } from './types';
import { ChatMessageItem } from './ChatMessageItem';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageListProps {
  messages: IChatMessage[];
  isLoading: boolean;
  botAvatarUrl?: string;
  onSelectPrompt?: (promptText: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = React.memo(({
  messages,
  isLoading,
  botAvatarUrl = BOT_METADATA.avatarUrl,
  onSelectPrompt,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevMsgCountRef = useRef(messages.length);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Nếu lần đầu tải lịch sử: cuộn tức thì (auto) để không giật animation
    if (prevMsgCountRef.current === 0 && messages.length > 0) {
      scrollToBottom('auto');
    } else if (messages.length > prevMsgCountRef.current || isLoading) {
      // Chỉ cuộn mượt khi có tin nhắn mới thêm vào hoặc bot bật trạng thái suy nghĩ
      scrollToBottom('smooth');
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 overscroll-contain">
      {/* 1. Trạng thái khởi đầu: Chưa có tin nhắn */}
      {messages.length === 0 && (
        <div className="my-2 p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden border-2 border-white shadow-xs">
            <img
              src={botAvatarUrl}
              alt="Charles Assistant"
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">
            Chào mừng bạn đến với {BOT_METADATA.name}!
          </h4>
          <div className="text-xs text-gray-600 text-left bg-white p-3 rounded-xl border border-sky-100/80 shadow-xs mt-2">
            <MarkdownRenderer content={BOT_METADATA.defaultGreeting} />
          </div>

          {/* Gợi ý nhanh: Nằm ngay bên dưới đoạn văn bản chào mừng */}
          <div className="mt-3 pt-2.5 border-t border-sky-200/60 text-left">
            <div className="flex items-center gap-1.5 mb-2 px-0.5">
              <i className="fa-classic fa-solid fa-wand-magic-sparkles text-xs text-sky-600" aria-hidden="true" />
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                Gợi ý nhanh cho bạn
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelectPrompt?.(prompt.promptText)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-sky-900 bg-white border border-sky-200 rounded-xl shadow-2xs hover:bg-sky-100/70 hover:border-sky-300 transition-all cursor-pointer disabled:opacity-50 select-none active:scale-95"
                  title={prompt.promptText}
                >
                  <i className={`${prompt.icon} text-xs text-sky-600`} aria-hidden="true" />
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Danh sách tin nhắn */}
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          botAvatarUrl={botAvatarUrl}
        />
      ))}

      {/* 3. Hiệu ứng đang suy nghĩ (Typing indicator) */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-2 pr-6">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-sky-200 shadow-xs">
            <img
              src={botAvatarUrl}
              alt="Charles typing"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-2xl rounded-tl-xs border border-gray-200/60 shadow-xs flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium mr-1">
              Charles đang suy nghĩ
            </span>
            <span className="w-1.5 h-1.5 bg-[#0369A1] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-[#0369A1] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-[#0369A1] rounded-full animate-bounce" />
          </div>
        </div>
      )}

      {/* Điểm neo để tự cuộn */}
      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessageList.displayName = 'ChatMessageList';
