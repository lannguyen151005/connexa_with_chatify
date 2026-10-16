
export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "HAHA"
  | "WOW"
  | "SAD"
  | "ANGRY";

export const REACTION_OPTIONS: {
  type: ReactionType;
  label: string;
  emoji: string;
}[] = [
  { type: "LIKE", label: "Thích", emoji: "👍" },
  { type: "LOVE", label: "Yêu thích", emoji: "❤️" },
  { type: "HAHA", label: "Haha", emoji: "😂" },
  { type: "WOW", label: "Wow", emoji: "😮" },
  { type: "SAD", label: "Buồn", emoji: "😢" },
  { type: "ANGRY", label: "Phẫn nộ", emoji: "😡" },
];

export interface ReactionUser {
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  type: ReactionType;
  createdAt: string;
}

export interface PostMedia {
  id: string;
  media_url: string;
}

export interface PostInfo {
  id: string;
  content: string;
  created_at: string;
  author: {
    id?: string;
    username?: string;
    avatar_url?: string | null;
  };
  media_list?: PostMedia[];
  like_count: number;
  comment_count: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  content: string;
  parentId: string | null;
  createdAt: string;

  // Trạng thái tương tác dùng trên giao diện
  myReaction?: ReactionType | null;
  reactionCount?: number;
  reactions?: ReactionUser[];
}
