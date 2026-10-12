import React from "react";

const onlineFriends = [
  { id: "f1", name: "Harry", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "f2", name: "chris dhaniel", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "f3", name: "April", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "f4", name: "Lara", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "f5", name: "Kenny", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "f6", name: "Reyana", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80" },
];

export default function OnlineFriendsWidget() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="mb-4 text-xs font-bold text-gray-500 tracking-wider">
        Online Friends
      </h3>
      <div className="space-y-3">
        {onlineFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition"
          >
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <span className="text-xs font-medium text-gray-700">{friend.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}