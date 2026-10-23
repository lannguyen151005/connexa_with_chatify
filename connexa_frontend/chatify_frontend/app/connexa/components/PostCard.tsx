"use client";

import React, { useState } from "react";

interface PostCardProp {
  posts: any[];
  onSelectViewDetail: (id: string) => void;
}

export default function PostCard({ posts, onSelectViewDetail }: PostCardProp) {
  const [likes, setLikes] = useState(124);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      {posts.length === 0 ? (
        <div>
          <p className="text-gray-500 text-center">Chưa có bài viết nào.</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id}>
              <div onClick={() => onSelectViewDetail?.(post.id)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar_url}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="text-left mt-3">
                      <h4 className="text-sm font-bold text-orange-600 hover:underline cursor-pointer">
                        {post.author.username}
                      </h4>
                      <p className="text-xs text-gray-400">{new Date(post.created_at).toDateString()}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>

                {/* Content */}
                <p className="mt-4 text-2xl leading-relaxed text-gray-700 text-left">
                  {post.content}
                </p>

                {/* Image Attachment */}
                {Array.isArray(post.media_list) && post.media_list.length > 0 && (
                  <div
                    className="mt-4 grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(post.media_list.length, 3)}, minmax(0, 1fr))`,
                    }}
                  >
                    {post.media_list.map((media: any) => (
                      <div
                        key={media.id}
                        className="overflow-hidden rounded-xl bg-gray-100"
                      >
                        <img
                          src={media.media_url}
                          alt="Post content"
                          className="h-full max-h-[450px] min-h-32 w-full object-cover transition hover:scale-[1.01]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-3 text-gray-500">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition ${isLiked ? "text-rose-500" : "hover:text-rose-500"
                    }`}
                >
                  <i className={`${isLiked ? "fas fa-heart text-rose-500" : "far fa-heart"}`}></i>
                  <span>{post.like_count}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-orange-600 transition">
                  <i className="fas fa-comment"></i>
                  <span>{post.comment_count}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-orange-600 transition">
                  <i className="fas fa-share"></i>
                  <span>5</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}