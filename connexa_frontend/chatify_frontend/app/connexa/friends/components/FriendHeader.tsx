
"use client";

interface FriendsHeaderProps {
  totalElements: number;
  onlineCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (value: boolean) => void;
}

export default function FriendsHeader({
  totalElements,
  onlineCount,
  search,
  onSearchChange,
  onlineOnly,
  onOnlineOnlyChange,
}: FriendsHeaderProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bạn bè
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Kết nối với mọi người trên Connexa.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-xl bg-[#e8f7fc] px-4 py-3">
            <p className="text-xs text-gray-500">Tổng bạn bè</p>
            <p className="mt-1 text-xl font-bold text-[#35baf0]">
              {totalElements}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 px-4 py-3">
            <p className="text-xs text-gray-500">Đang online</p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {onlineCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm kiếm bạn bè..."
            aria-label="Tìm kiếm bạn bè"
            className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#35baf0] focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          type="button"
          aria-pressed={onlineOnly}
          onClick={() => onOnlineOnlyChange(!onlineOnly)}
          className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
            onlineOnly
              ? "border-[#35baf0] bg-[#35baf0] text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-[#35baf0] hover:text-[#20aee8]"
          }`}
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
          Đang hoạt động
        </button>
      </div>
    </div>
  );
}
