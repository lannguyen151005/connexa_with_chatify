import React, { useState, useRef, useEffect } from 'react';

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  onToggleQuickPrompts?: () => void;
  isQuickPromptsOpen?: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = React.memo(({
  onSendMessage,
  isLoading,
  placeholder = 'Nhập câu hỏi hoặc yêu cầu viết caption...',
  onToggleQuickPrompts,
  isQuickPromptsOpen = false,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Hàm tính toán và co giãn chiều cao của ô nhập liệu
  const adjustHeight = (targetElement?: HTMLTextAreaElement | null) => {
    const textarea = targetElement || textareaRef.current;
    if (!textarea) return;

    // Đặt về auto trước để tính toán chính xác scrollHeight hiện tại
    textarea.style.height = 'auto';
    const MAX_HEIGHT = 112; // Giới hạn chiều cao tối đa của ô nhập liệu (~4-5 dòng)
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > MAX_HEIGHT) {
      textarea.style.height = `${MAX_HEIGHT}px`;
      textarea.style.overflowY = 'auto';
      // Tự động cuộn theo con trỏ khi gõ ở những dòng cuối
      textarea.scrollTop = textarea.scrollHeight;
    } else {
      textarea.style.height = `${Math.max(scrollHeight, 24)}px`;
      textarea.style.overflowY = 'hidden';
    }
  };

  // Tự động đồng bộ chiều cao khi inputText thay đổi
  useEffect(() => {
    adjustHeight();
  }, [inputText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustHeight(e.target);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled = inputText.trim() === '' || isLoading;

  return (
    <div className="p-2.5 bg-white border-t border-gray-200">
      <div className="flex items-end gap-1.5 bg-gray-50 border border-gray-300 rounded-2xl px-3 py-1.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
        {/* Textarea nhập nội dung: Tự động xuống dòng, tự phình to, chặn kéo resize thủ công */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          disabled={isLoading}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          wrap="soft"
          style={{
            resize: 'none',
            maxHeight: '112px',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            overflowX: 'hidden',
          }}
          className="flex-1 min-w-0 bg-transparent border-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none !resize-none max-h-28 leading-5 py-1 disabled:opacity-60 break-all [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
        />

        {/* Nút bật/tắt gợi ý nhanh */}
        {onToggleQuickPrompts && (
          <button
            type="button"
            onClick={onToggleQuickPrompts}
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all select-none cursor-pointer ${
              isQuickPromptsOpen
                ? 'bg-sky-100 text-[#0369A1] shadow-xs'
                : 'text-gray-400 hover:text-[#0369A1] hover:bg-sky-100/60'
            }`}
            title={isQuickPromptsOpen ? 'Ẩn bảng gợi ý' : 'Mở bảng gợi ý nhanh'}
            aria-label="Gợi ý nhanh"
          >
            <i className="fa-classic fa-solid fa-wand-magic-sparkles text-xs" aria-hidden="true" />
          </button>
        )}

        {/* Nút gửi tin nhắn */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all select-none cursor-pointer ${
            isSendDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#0369A1] hover:bg-[#075985] text-white active:scale-95 shadow-xs'
          }`}
          title="Gửi tin nhắn (Enter)"
          aria-label="Gửi tin nhắn"
        >
          <i className="fa-classic fa-solid fa-paper-plane text-xs" aria-hidden="true" />
        </button>
      </div>

      <div className="flex justify-between items-center px-1.5 mt-1 text-[10px] text-gray-400 select-none">
        <span>Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</span>
      </div>
    </div>
  );
});

ChatInputArea.displayName = 'ChatInputArea';
