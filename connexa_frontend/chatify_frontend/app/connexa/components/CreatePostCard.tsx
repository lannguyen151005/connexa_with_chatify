"use client";

import React from "react"; import { useCreatePost } from "../hooks/useCreatePost"; import PostMediaPreview from "./PostMediaPreview"; import PostPrivacySelect from "./PostPrivacySelect"; import PostActions from "./PostActions"; import { CreatePostCardProps } from "../types/Post";

export default function CreatePostCard({ currentUser, onPostCreated, }: CreatePostCardProps) {
  const post = useCreatePost(onPostCreated);

  const avatar = currentUser?.avatarUrl || currentUser?.avatar_url || "/default-avatar.png";

  return (<form onSubmit={post.handleSubmit} className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-slate-200/40"

  >
    {/* Header */}
    <div className="flex items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
      <img
        src={avatar}
        alt="User avatar"
        className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-xl ring-1 ring-slate-200"
      />
      <div className="w-full pt-1">
        <textarea
          value={post.content}
          onChange={(event) =>
            post.setContent(event.target.value)
          }
          placeholder="Bạn đang nghĩ gì vậy?"
          rows={2}
          disabled={post.isSubmitting}
          className="h-12 w-full mt-1 !resize-none rounded-2xl border border-transparent bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 hover:bg-slate-100/70 focus:border-sky-200 focus:bg-white focus:ring-4 focus:ring-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

    </div>

    {/* Media preview */}
    <div className="px-5 sm:px-6">
      <PostMediaPreview
        media={post.media}
        onRemove={post.handleRemoveFile}
        disabled={post.isSubmitting}
      />
    </div>

    {/* Quyền riêng tư */}
    <div className="px-5 sm:px-6">
      <PostPrivacySelect
        privacy={post.privacy}
        onChange={post.setPrivacy}
        disabled={post.isSubmitting}
      />
    </div>

    {/* Input ảnh */}
    <input
      ref={post.imageInputRef}
      type="file"
      accept="image/*"
      multiple
      hidden
      disabled={post.isSubmitting}
      onChange={(event) =>
        post.handleSelectFiles(event, "IMAGE")
      }
    />

    {/* Input video */}
    <input
      ref={post.videoInputRef}
      type="file"
      accept="video/*"
      multiple
      hidden
      disabled={post.isSubmitting}
      onChange={(event) =>
        post.handleSelectFiles(event, "VIDEO")
      }
    />

    {/* Actions */}
    <div className="mt-3 border-t border-slate-100 px-5 py-4 sm:px-6">
      <PostActions
        isSubmitting={post.isSubmitting}
        canSubmit={
          !!post.content.trim() || post.media.length > 0
        }
        onSelectImages={() =>
          post.imageInputRef.current?.click()
        }
        onSelectVideos={() =>
          post.videoInputRef.current?.click()
        }
      />
    </div>
  </form>


  );
}