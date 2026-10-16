"use client";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface FriendItems {
  friends: Friend[];
  onSelectViewAll?: (id: string) => void;
}

export const FriendWidget = ({
  friends,
  onSelectViewAll,
}: FriendItems) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="mb-4 text-xs font-bold text-gray-500 tracking-wider">
        Bạn bè
      </h3>

      <hr className="my-2" />

      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectViewAll?.(friend.id)}
            role="button"
            tabIndex={0}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
          >
            <div className="relative">
              <img
                src={
                  friend.avatar_url ||
                  "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                }
                alt={friend.username}
                className="h-8 w-8 rounded-full object-cover"
              />

              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                  friend.isOnline
                    ? "bg-emerald-500"
                    : "bg-gray-400"
                }`}
              />
            </div>

            <span className="text-xs font-medium text-gray-700">
              {friend.username}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {/* Xử lý xem tất cả bạn bè */}}
        className="mt-4 w-full rounded bg-[#3BBDF7] py-2 text-sm font-semibold text-white transition hover:bg-[#33a0d6]"
      >
        Xem tất cả
      </button>
    </div>
  );
};