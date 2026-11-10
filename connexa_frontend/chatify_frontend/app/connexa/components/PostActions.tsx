"use client";

import React from "react";

interface Props { isSubmitting: boolean; canSubmit: boolean; onSelectImages: () => void; onSelectVideos: () => void; }

export default function PostActions({ isSubmitting, canSubmit, onSelectImages, onSelectVideos, }: Props) { return ( <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> {/* Nút thêm media */} <div className="flex items-center gap-2"> <button
type="button"
onClick={onSelectImages}
disabled={isSubmitting}
className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition duration-200 hover:border-emerald-200 hover:bg-emerald-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
> <i className="fas fa-image text-sm" /> <span>Ảnh</span> </button>

    <button
      type="button"
      onClick={onSelectVideos}
      disabled={isSubmitting}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 transition duration-200 hover:border-violet-200 hover:bg-violet-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <i className="fas fa-video text-sm" />
      <span>Video</span>
    </button>
  </div>

  {/* Nút đăng bài */}
  <button
    type="submit"
    disabled={isSubmitting || !canSubmit}
    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] px-7 py-3 text-sm font-bold text-white shadow-md shadow-sky-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-200/70 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
  >
    {isSubmitting ? (
      <>
        <i className="fas fa-spinner fa-spin" />
        <span>Đang đăng bài...</span>
      </>
    ) : (
      <>
        <i className="fas fa-paper-plane" />
        <span>Chia sẻ bài viết</span>
      </>
    )}
  </button>
</div>


); }