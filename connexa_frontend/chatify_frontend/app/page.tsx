import CreatePostCard from "./connexa/components/CreatePostCard";
import Header from "./connexa/components/Header";
import OnlineFriendsWidget from "./connexa/components/OnlineFriendWidget";
import PostCard from "./connexa/components/PostCard";
import Sidebar from "./connexa/components/Sidebar";


export default function ConnexaHomePage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-800">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          
          {/* Cột trái - Sidebar (3 cols) */}
          <div className="hidden md:block md:col-span-3">
            <Sidebar />
          </div>

          {/* Cột giữa - Feed chính (6 cols) */}
          <div className="md:col-span-6 space-y-5">
            <CreatePostCard />
            <PostCard />
          </div>

          {/* Cột phải - Widgets (3 cols) */}
          <div className="hidden md:block md:col-span-3 space-y-5">
            <OnlineFriendsWidget />
          </div>

        </div>
      </main>
    </div>
  );
}