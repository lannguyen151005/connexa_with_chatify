
"use client";

interface FriendPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export default function FriendPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: FriendPaginationProps) {
  if (totalPages <= 0) return null;

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index
  ).filter(
    (number) =>
      number === 0 ||
      number === totalPages - 1 ||
      Math.abs(number - page) <= 2
  );

  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-gray-500">
        Tổng cộng{" "}
        <span className="font-semibold text-gray-800">
          {totalElements}
        </span>{" "}
        bạn bè · Trang{" "}
        <span className="font-semibold text-gray-800">
          {page + 1}
        </span>{" "}
        / {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-[#35baf0] hover:text-[#20aee8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Trước
        </button>

        {visiblePages.map((number, index) => (
          <span
            key={number}
            className="inline-flex items-center gap-2"
          >
            {index > 0 &&
              number - visiblePages[index - 1] > 1 && (
                <span className="text-gray-400">...</span>
              )}

            <button
              type="button"
              aria-label={`Trang ${number + 1}`}
              aria-current={page === number ? "page" : undefined}
              disabled={page === number}
              onClick={() => onPageChange(number)}
              className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                page === number
                  ? "border-[#35baf0] bg-[#35baf0] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#35baf0] hover:text-[#20aee8]"
              }`}
            >
              {number + 1}
            </button>
          </span>
        ))}

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-[#35baf0] hover:text-[#20aee8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
}
