import React from "react";

const menuItems = [
    { icon: "fas fa-home", label: "Home", active: true },
    { icon: "fas fa-compass", label: "Explore", active: false },
    { icon: "fas fa-fire", label: "Trending", active: false },
    { icon: "fas fa-list-ul", label: "Lists", active: false },
    { icon: "fas fa-bookmark", label: "Saved", active: false },
    { icon: "fas fa-cog", label: "Settings", active: false },
];

export default function Sidebar() {
    return (
        <aside className="sticky top-20 flex flex-col justify-between h-[calc(100vh-6rem)]">
            {/* Navigation Menu */}
            <div className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            className={`flex w-full items-center gap-3.5 rounded px-4 py-3 text-sm font-semibold transition ${item.active
                                    ? "bg-gradient-to-r from-[#3BBDF7] to-[#64CFF5] text-white shadow-md shadow-orange-500/20"
                                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                                }`}
                        >
                            <i className={`${item.icon} w-5 text-center`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm ">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                                alt="Vijay"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="truncate">
                                <h4 className="text-sm font-bold text-gray-900 truncate">Vijay</h4>
                                <p className="text-xs text-gray-400 truncate">@vijay98</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                            <i className="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </nav>
            </div>

           
        </aside>
    );
}