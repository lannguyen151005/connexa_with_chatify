
export type Privacy = "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";

export type MediaType = "IMAGE" | "VIDEO";

export interface SelectedFile {
  file: File;
  previewUrl: string;
  mediaType: MediaType;
}

export interface PostMediaPayload {
  id: string;
  media_url: string;
  media_type: MediaType;
  display_order: number;
}

export interface CreatePostPayload {
  content: string;
  privacy: Privacy;
  media_list: PostMediaPayload[];
}

export interface CreatePostCardProps {
  currentUser: any;
  onPostCreated?: (post: any) => void;
}
