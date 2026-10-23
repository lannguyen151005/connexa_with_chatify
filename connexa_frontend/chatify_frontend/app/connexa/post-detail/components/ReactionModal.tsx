
"use client";

import { useEffect } from "react";
import {
    REACTION_OPTIONS,
    type ReactionUser,
} from "../types/post";

interface Props {
    open: boolean;
    reactions: ReactionUser[];
    onClose: () => void;
}

export default function ReactionModal({
    open,
    reactions,
    onClose,
}: Props) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="reaction-title"
                className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            >
                <header className="flex items-center justify-between border-b p-4">
                    <h2
                        id="reaction-title"
                        className="font-bold text-gray-800"
                    >
                        Tất cả cảm xúc ({reactions.length})
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <i className="fas fa-times" />
                    </button>
                </header>

                <div className="overflow-y-auto p-4">
                    {reactions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            Chưa có ai bày tỏ cảm xúc.
                        </p>
                    ) : (
                        <div className="space-y-4">

                            {reactions.map((user) => {
                                const reaction = REACTION_OPTIONS.find(
                                    (item) => item.type === user.type
                                );

                                return (
                                    <div
                                        key={`${user.authorId}-${user.type}`}
                                        className="flex items-center gap-3"
                                    >
                                        <img
                                            src={
                                                user.authorAvatarUrl ||
                                                "/default-avatar.png"
                                            }
                                            alt={user.authorName}
                                            className="h-11 w-11 rounded-full object-cover"
                                        />

                                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                            {user.authorName}
                                        </span>

                                        <span title={reaction?.label}>
                                            {reaction?.emoji ?? "👍"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
