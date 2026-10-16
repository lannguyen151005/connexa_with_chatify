import React from "react";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface FriendListProfileProps {
  friends: Friend[];
  onSelectViewAll?: (id: string) => void;
}

export default function FriendListProfile({
  friends,
  onSelectViewAll,
}: FriendListProfileProps) {
  if (friends.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <p className="text-center text-gray-500">
          Chưa có bạn bè nào.
        </p>
      </div>
      
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
      {friends.map((friend) => (
        <button
          key={friend.id}
          type="button"
          onClick={() => onSelectViewAll?.(friend.id)}
          className="flex min-w-0 flex-col items-center gap-1 rounded-xl p-2 transition hover:bg-gray-100"
        >
          <div className="relative">
            <img
              src={
                friend.avatar_url ||
                "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
              }
              alt={friend.username}
              className="h-16 w-16 rounded-full border border-gray-200 object-cover"
            />

            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${friend.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
            />
          </div>

          <span className="max-w-full break-words text-center text-sm font-medium text-gray-700">
            {friend.username}
          </span>

          <span className="text-xs text-gray-400">
            {friend.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
          </span>
        </button>
      ))}
    </div>
  );
}
