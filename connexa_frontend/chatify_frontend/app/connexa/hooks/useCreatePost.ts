
"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { CreatePostPayload, MediaType, Privacy, SelectedFile } from "../types/Post";
import { createPost, uploadPostFile } from "../services/PostService";


export function useCreatePost(
  onPostCreated?: (post: any) => void
) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("PUBLIC");
  const [media, setMedia] = useState<SelectedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    mediaType: MediaType
  ) => {
    const files = Array.from(event.target.files ?? []);

    const validFiles = files.filter((file) =>
      mediaType === "IMAGE"
        ? file.type.startsWith("image/")
        : file.type.startsWith("video/")
    );

    if (validFiles.length !== files.length) {
      toast.error("Có file không đúng định dạng.");
    }

    const newFiles = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      mediaType,
    }));

    setMedia((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setMedia((prev) => {
      const selected = prev[index];

      if (selected) URL.revokeObjectURL(selected.previewUrl);

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!content.trim() && media.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc chọn ảnh/video.");
      return;
    }

    setIsSubmitting(true);

    try {
      const mediaList = await Promise.all(
        media.map(async (item, index) => ({
          id: "",
          media_url: await uploadPostFile(item.file),
          media_type: item.mediaType,
          display_order: index,
        }))
      );

      const payload: CreatePostPayload = {
        content: content.trim(),
        privacy,
        media_list: mediaList,
      };

      const post = await createPost(payload);

      toast.success("Đăng bài viết thành công!");
      onPostCreated?.(post);

      setContent("");
      setPrivacy("PUBLIC");

      media.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setMedia([]);

      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error: any) {
      console.error("Lỗi đăng bài viết:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi đăng bài viết."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    privacy,
    setPrivacy,
    media,
    isSubmitting,
    imageInputRef,
    videoInputRef,
    handleSelectFiles,
    handleRemoveFile,
    handleSubmit,
  };
}
