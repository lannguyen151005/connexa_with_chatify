export interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  _online?: boolean;
}

export interface FriendApiResponse {
  items: Friend[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  is_last: boolean;
}

export const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";