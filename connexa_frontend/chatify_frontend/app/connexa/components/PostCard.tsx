"use client";

import React, { useState } from "react";

export default function PostCard() {
  const [likes, setLikes] = useState(124);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Harry"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-sm font-bold text-orange-600 hover:underline cursor-pointer">
              Harry
            </h4>
            <p className="text-xs text-gray-400">7 months ago</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>

      {/* Content */}
      <p className="mt-4 text-sm leading-relaxed text-gray-700">
        My 1st Post, Have A Good Day Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro ipsum laborum necessitatibus ex doloragnam ea?
      </p>

      {/* Image Attachment */}
      <div className="mt-4 overflow-hidden rounded-xl bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Post content"
          className="max-h-[450px] w-full object-cover transition hover:scale-[1.01]"
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-3 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold transition ${
            isLiked ? "text-rose-500" : "hover:text-rose-500"
          }`}
        >
          <i className={`${isLiked ? "fas fa-heart text-rose-500" : "far fa-heart"}`}></i>
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-orange-600 transition">
          <i className="fas fa-comment"></i>
          <span>18</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-orange-600 transition">
          <i className="fas fa-share"></i>
          <span>5</span>
        </button>
      </div>
    </div>
  );
}