
"use client";

import { useState } from "react";
import type { ReactionUser } from "../types/post";
import ReactionModal from "./ReactionModal";

interface Props {
  reactions: ReactionUser[];
}

export default function ReactionSummary({
  reactions,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
            {reactions.slice(0, 3).map((user, index) => (
              <div
                key={`${user.authorId}-${user.type}`}
                className={index ? "-ml-2" : ""}
                style={{ zIndex: 3 - index }}
              >
                <img
                  src={
                    user.authorAvatarUrl ||
                    "/default-avatar.png"
                  }
                  alt={user.authorName}
                  title={user.authorName}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                />
              </div>
            ))}

            <span className="ml-3 truncate text-sm text-gray-500">
              {reactions.length
                ? `${reactions.length} lượt cảm xúc`
                : "Chưa có cảm xúc"}
            </span>
          </div>

          {!!reactions.length && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 text-sm font-semibold text-blue-600 hover:underline"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </section>

      <ReactionModal
        open={open}
        reactions={reactions}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
