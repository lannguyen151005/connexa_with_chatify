import React from "react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between bg-[#3BBDF7] px-6 py-2.5 text-white shadow-md">
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight drop-shadow">Connexa</h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-lg mx-4">
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                    type="text"
                    placeholder="Search post"
                    className="w-full rounded-full bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-inner outline-none transition focus:ring-2 focus:ring-orange-300"
                />
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-5">
                <Link href="/" className="p-1.5 transition hover:opacity-80">
                    <i className="fas fa-home text-lg"></i>
                </Link>
                <button className="relative p-1.5 transition hover:opacity-80">
                    <i className="fas fa-bell text-lg"></i>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-300 text-[10px] font-bold text-orange-900">
                    </span>
                </button>
                {/* Nút chuyển sang Chatify */}
                <Link href="/chat" className="p-1.5 transition hover:opacity-80" title="Mở tin nhắn Chatify">
                    <i className="fas fa-comments text-lg"></i>
                </Link>
                <button className="p-1.5 transition hover:opacity-80">
                    <i className="fas fa-users text-lg"></i>
                </button>

                <div className="ml-2 h-9 w-9 overflow-hidden rounded-full border-2 border-white/80 shadow">
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="User avatar"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}