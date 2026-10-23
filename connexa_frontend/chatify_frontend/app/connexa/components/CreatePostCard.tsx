import React from "react";

interface CreatePostCardProp{
  currentUser: any;
}


export default function CreatePostCard({currentUser}:CreatePostCardProp) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      {/* Input row */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
        <img
          src={currentUser.avatarUrl}
          alt="User avatar"
          className="h-11 w-11 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Bạn đang nghĩ gì vậy?"
          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Action buttons row */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 transition">
            <i className="fas fa-image text-orange-500 text-base"></i>
            <span>Ảnh</span>
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 transition">
            <i className="fas fa-video text-gray-900 text-base"></i>
            <span>Video</span>
          </button>

        </div>

        <button className="rounded bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition">
          Chia sẻ
        </button>
      </div>
    </div>
  );
}