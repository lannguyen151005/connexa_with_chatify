import React from "react";

const menuItems = [
    { icon: "fas fa-home", label: "Trang chủ", active: true },
    { icon: "fas fa-compass", label: "Khám phá", active: false },
    { icon: "fas fa-fire", label: "Xu hướng", active: false },
    { icon: "fas fa-bookmark", label: "Đã lưu", active: false },
    { icon: "fas fa-cog", label: "Cài đặt", active: false },
];

interface SidebarProps{
    currentUser: any;
}

export default function Sidebar(
    {currentUser}:SidebarProps
) {
    return (
        <aside className="sticky top-20 flex flex-col justify-between h-[calc(100vh-6rem)]">
            {/* Navigation Menu */}
            <div className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            className={`flex w-full items-center gap-3.5 rounded px-4 py-3 text-sm font-semibold transition ${item.active
                                    ? "bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] text-white shadow-md shadow-gray-500/20"
                                    : "text-gray-600 border-bottom hover:bg-gray-100/80 hover:text-gray-900"
                                }`}
                        >
                            <i className={`${item.icon} w-5 text-center`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm ">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img
                                src={currentUser?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt="Vijay"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="truncate mt-2">
                                <h4 className="text-xs font-bold text-gray-900 truncate">{currentUser?.username || "Unknown User"}</h4>
                                <p className="text-xs text-gray-400 truncate">@{currentUser?.username || "Unknown User"}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full shadow-sm">
                            <i className="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </nav>
            </div>

           
        </aside>
    );
}