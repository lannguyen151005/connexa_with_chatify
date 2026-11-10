
import api from "@/app/utils/api";
import { CreatePostPayload } from "../types/Post";

export async function uploadPostFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/upload", formData, {
    timeout: 180000,
  });

  const url = response.data?.url;

  if (!url) {
    throw new Error("Backend không trả về URL file.");
  }

  return url;
}

export async function createPost(payload: CreatePostPayload) {
  const response = await api.post("/api/v1/posts", payload);
  const result = response.data;

  if (result?.success === false) {
    throw new Error(result.message || "Đăng bài thất bại.");
  }

  return result?.data ?? result;
}
