import React from 'react';
import { DEFAULT_QUICK_PROMPTS, IQuickPrompt } from './types';

interface QuickPromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="px-3 py-2 border-b border-gray-100 bg-slate-50/70">
      <div className="flex items-center gap-1.5 mb-1.5">
        <i className="fa-classic fa-solid fa-wand-magic-sparkles text-xs text-sky-600" aria-hidden="true" />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Gợi ý nhanh cho bạn
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_QUICK_PROMPTS.map((prompt: IQuickPrompt) => (
          <button
            key={prompt.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt.promptText)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-900 bg-white border border-sky-200 rounded-full shadow-xs hover:bg-sky-50 hover:border-sky-300 hover:text-sky-950 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95"
            title={prompt.promptText}
          >
            <i className={`${prompt.icon} text-[10px] text-sky-600`} aria-hidden="true" />
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
