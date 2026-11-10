"use client";

import React from "react"; import { SelectedFile } from "../types/Post";

interface Props { media: SelectedFile[]; onRemove: (index: number) => void; disabled: boolean; }

export default function PostMediaPreview({ media, onRemove, disabled, }: Props) { if (media.length === 0) return null;

return ( <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"> <div className="mb-3 flex items-center justify-between"> <div className="flex items-center gap-2"> <i className="fas fa-paperclip text-sm text-sky-500" /> <span className="text-sm font-semibold text-slate-700"> Tệp đính kèm </span> </div>

    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
      {media.length} tệp
    </span>
  </div>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {media.map((item, index) => (
      <div
        key={`${item.file.name}-${item.file.lastModified}-${index}`}
        className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative overflow-hidden bg-slate-100">
          {item.mediaType === "IMAGE" ? (
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-40"
            />
          ) : (
            <video
              src={item.previewUrl}
              controls
              preload="metadata"
              className="h-32 w-full object-cover sm:h-40"
            />
          )}

          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            aria-label={`Xóa ${item.file.name}`}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-sm text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fas fa-times" />
          </button>

          {item.mediaType === "IMAGE" && (
            <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <i className="fas fa-image mr-1" />
              Image
            </div>
          )}
        </div>

        <div className="px-3 py-2.5">
          <p
            title={item.file.name}
            className="truncate text-xs font-medium text-slate-700"
          >
            {item.file.name}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {item.file.size < 1024 * 1024
              ? `${(item.file.size / 1024).toFixed(0)} KB`
              : `${(item.file.size / (1024 * 1024)).toFixed(1)} MB`}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


); }