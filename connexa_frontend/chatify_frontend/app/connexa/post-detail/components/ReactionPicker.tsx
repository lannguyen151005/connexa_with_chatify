
"use client";

import { useState } from "react";
import {
  REACTION_OPTIONS,
  type ReactionType,
} from "../types/post";

interface Props {
  value: ReactionType | null;
  onChange: (type: ReactionType | null) => void;
  compact?: boolean;
}

export default function ReactionPicker({
  value,
  onChange,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = REACTION_OPTIONS.find(
    (item) => item.type === value
  );

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (value) {
            onChange(null);
          } else {
            onChange("LIKE");
          }
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold transition hover:bg-gray-100 ${
          value ? "text-blue-600" : "text-gray-500"
        }`}
        aria-label={value ? "Bỏ cảm xúc" : "Thích"}
      >
        <span className="text-lg">
          {selected?.emoji ?? "👍"}
        </span>
        {!compact && (
          <span>{selected?.label ?? "Thích"}</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Chọn loại cảm xúc"
        aria-expanded={open}
        className="rounded-md px-1.5 py-2 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <i className="fas fa-chevron-down" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Đóng bảng cảm xúc"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute bottom-full left-0 z-30 mb-2 flex max-w-[calc(100vw-40px)] gap-1 rounded-full border border-gray-100 bg-white p-2 shadow-xl">
            {REACTION_OPTIONS.map((reaction) => (
              <button
                key={reaction.type}
                type="button"
                title={reaction.label}
                aria-label={reaction.label}
                onClick={() => {
                  onChange(
                    value === reaction.type
                      ? null
                      : reaction.type
                  );
                  setOpen(false);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl transition hover:-translate-y-1 hover:bg-gray-100 ${
                  value === reaction.type
                    ? "bg-blue-50 ring-2 ring-blue-400"
                    : ""
                }`}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
