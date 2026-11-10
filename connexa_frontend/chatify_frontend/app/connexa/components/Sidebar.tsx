
"use client";

import React from "react";
import { useRouter } from "next/navigation";

type FeedMode = "feed" | "discover" | "trending";

const menuItems = [
  {
    icon: "fas fa-home",
    label: "Trang chủ",
    tab: "feed" as const,
  },
  {
    icon: "fas fa-compass",
    label: "Khám phá",
    tab: "discover" as const,
  },
  {
    icon: "fas fa-fire",
    label: "Xu hướng",
    tab: "trending" as const,
  },
  {
    icon: "fas fa-cog",
    label: "Cài đặt",
    tab: null,
  },
];

interface SidebarProps {
  currentUser: any;
  activeTab?: FeedMode | null;
  onHomeClick?: () => void;
  onDiscoverClick?: () => void;
  onTrendingClick?: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab = null,
  onDiscoverClick,
  onHomeClick,
  onTrendingClick,
}: SidebarProps) {
  const router = useRouter();

  const handleMenuClick = (tab: FeedMode | null) => {
    switch (tab) {
      case "feed":
        if (onHomeClick) {
          onHomeClick();
        } else {
          router.push("/");
        }
        break;

      case "discover":
        if (onDiscoverClick) {
          onDiscoverClick();
        } else {
          router.push("/");
        }
        break;

      case "trending":
        if (onTrendingClick) {
          onTrendingClick();
        } else {
          router.push("/");
        }
        break;

      default:
        break;
    }
  };

  return (
    <aside className="sticky top-20 flex h-[calc(100vh-6rem)] flex-col justify-between">

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">

        <nav className="space-y-1">

          {menuItems.map((item) => {

            const isActive = item.tab !== null && item.tab === activeTab;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleMenuClick(item.tab)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? item.tab === "trending"
                      ? "bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] text-white shadow-md shadow-blue-500/20"
                      : "bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] text-white shadow-md shadow-blue-500/20"
                    : "border-b border-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
              >
                <i className={`${item.icon} w-5 text-center`} />

                <span>{item.label}</span>
              </button>
            );

          })}

          {/* CURRENT USER */}

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 p-3.5">

            <div className="flex items-center gap-3 overflow-hidden">

              <img
                src={
                  currentUser?.avatarUrl ||
                  currentUser?.avatar_url ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover"
              />

              <div className="min-w-0">

                <h4 className="truncate text-xs font-bold text-gray-900">
                  {currentUser?.username || "Unknown User"}
                </h4>

                <p className="truncate text-xs text-gray-400">
                  @{currentUser?.username || "Unknown User"}
                </p>

              </div>

            </div>

            <button
              type="button"
              className="rounded-full p-1 text-gray-400 shadow-sm transition hover:bg-white hover:text-gray-600"
            >
              <i className="fas fa-ellipsis-h" />
            </button>

          </div>

        </nav>

      </div>

    </aside>
  );
}
