import React from 'react';

/**
 * Trình render Markdown thuần (Zero-dependency)
 * Hỗ trợ an toàn các định dạng văn bản phổ biến mà LLM sinh ra:
 * - In đậm: **nội dung**
 * - In nghiêng: *nội dung*
 * - Code inline / hashtag: `code`
 * - Khối trích dẫn: > trích dẫn
 * - Danh sách gạch đầu dòng: - mục hoặc * mục
 * - Danh sách số: 1. mục
 * - Xuống dòng: \n
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const lines = content.split('\n');

  const renderInline = (text: string): React.ReactNode => {
    // Regex tách các định dạng inline: bold (**...**), italic (*...*), code (`...`)
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-gray-900">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
        return (
          <em key={idx} className="italic text-gray-800">
            {token.slice(1, -1)}
          </em>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono font-medium text-sky-800 bg-sky-100 rounded border border-sky-200"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div className={`space-y-1.5 text-sm leading-relaxed text-gray-800 ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // 1. Dòng trống
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // 2. Trích dẫn Blockquote (> ...)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote
              key={lineIdx}
              className="pl-3 py-1 my-1 border-l-3 border-[#3BBDF7] bg-sky-50/60 rounded-r text-gray-700 italic"
            >
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // 3. Danh sách gạch đầu dòng (- ... hoặc * ...)
        if (/^[-*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="text-[#0369A1] font-bold select-none leading-5">•</span>
              <div className="flex-1">{renderInline(bulletText)}</div>
            </div>
          );
        }

        // 4. Danh sách đánh số (1. ...)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-[#0369A1] select-none text-xs leading-5">
                {numberedMatch[1]}.
              </span>
              <div className="flex-1">{renderInline(numberedMatch[2])}</div>
            </div>
          );
        }

        // 5. Đoạn văn thường
        return (
          <p key={lineIdx} className="m-0">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};
