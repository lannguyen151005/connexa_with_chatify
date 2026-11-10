
"use client";

import { useRouter } from "next/navigation";
import { DEFAULT_AVATAR, Friend } from "../types/Friend";


interface FriendListProps {
  friends: Friend[];
  loading: boolean;
  error: string;
  search: string;
  onlineOnly: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export default function FriendList({
  friends,
  loading,
  error,
  search,
  onlineOnly,
  onRetry,
  onClearFilters,
}: FriendListProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-800">
          Tất cả bạn bè
        </h2>

        <span className="rounded-full bg-[#e8f7fc] px-3 py-1 text-sm font-semibold text-[#20aee8]">
          {friends.length} người
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div
            className="h-9 w-9 animate-spin rounded-full border-4 border-[#35baf0] border-t-transparent"
            role="status"
            aria-label="Đang tải"
          />
          <p className="mt-4 text-sm text-gray-500">
            Đang tải danh sách bạn bè...
          </p>
        </div>
      ) : error ? (
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-red-500">{error}</p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-[#35baf0] px-5 py-2.5 font-semibold text-white transition hover:bg-sky-500"
          >
            Thử lại
          </button>
        </div>
      ) : friends.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f7fc] text-[#35baf0]">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <h3 className="mt-4 font-semibold text-gray-700">
            {search || onlineOnly
              ? "Không tìm thấy bạn bè phù hợp"
              : "Bạn chưa có bạn bè nào"}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            {search || onlineOnly
              ? "Hãy thử thay đổi từ khóa tìm kiếm."
              : "Khám phá Connexa để kết nối với mọi người nhé!"}
          </p>

          {(search || onlineOnly) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 font-semibold text-[#20aee8] hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="group flex items-center gap-4 px-4 py-4 transition hover:bg-[#f8fcfe] sm:px-6"
            >
              <button
                type="button"
                aria-label={`Xem hồ sơ ${friend.username}`}
                onClick={() =>
                  router.push(`/connexa/profile/${friend.id}`)
                }
                className="relative shrink-0"
              >
                <img
                  src={friend.avatar_url || DEFAULT_AVATAR}
                  alt={friend.username}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="h-14 w-14 rounded-full border border-gray-100 object-cover sm:h-16 sm:w-16"
                />

                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-white ${
                    friend._online
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/connexa/profile/${friend.id}`)
                }
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-bold text-gray-800 transition group-hover:text-[#20aee8]">
                  {friend.username}
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      friend._online
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />

                  {friend._online
                    ? "Đang hoạt động"
                    : "Đang ngoại tuyến"}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/connexa/profile/${friend.id}`)
                }
                className="shrink-0 rounded-lg border border-[#35baf0] px-3 py-2 text-xs font-semibold text-[#20aee8] transition hover:bg-[#35baf0] hover:text-white sm:px-5 sm:text-sm"
              >
                Xem hồ sơ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
