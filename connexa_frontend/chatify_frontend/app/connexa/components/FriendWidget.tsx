
"use client";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface FriendWidgetProps {
  friends: Friend[];
  onSelectViewAll?: () => void;
  onSelectViewProfile?: (id: string) => void;
}

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export const FriendWidget = ({
  friends,
  onSelectViewAll,
  onSelectViewProfile,
}: FriendWidgetProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Bạn bè
        </h3>

        <span className="rounded-full bg-[#e8f7fc] px-2.5 py-1 text-xs font-semibold text-[#20aee8]">
          {friends.length}
        </span>
      </div>

      <hr className="border-gray-100" />

      {friends.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">
            Chưa có bạn bè nào.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          {friends.slice(0, 5).map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => onSelectViewProfile?.(friend.id)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#f0faff]"
            >
              <div className="relative shrink-0">
                <img
                  src={friend.avatar_url || DEFAULT_AVATAR}
                  alt={friend.username}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="h-10 w-10 rounded-full border border-gray-100 object-cover"
                />

                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    friend.isOnline
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
              </div>

              <span className="truncate text-sm font-medium text-gray-700">
                {friend.username}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onSelectViewAll}
        className="mt-4 w-full rounded-lg bg-[#35baf0] py-2.5 text-sm font-semibold text-white transition hover:bg-[#20aee8]"
      >
        Xem tất cả
      </button>
    </div>
  );
};
