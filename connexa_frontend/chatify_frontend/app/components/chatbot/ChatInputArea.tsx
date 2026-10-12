import React, { useState, useRef, useEffect } from 'react';

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Nhập câu hỏi hoặc yêu cầu viết caption...',
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Tự động điều chỉnh chiều cao theo nội dung
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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
      <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl px-3 py-1.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
        {/* Textarea nhập nội dung */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          disabled={isLoading}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none max-h-28 leading-5 py-1 disabled:opacity-60"
        />

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
};
