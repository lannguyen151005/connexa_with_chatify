"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ConversationList } from './chat/ConversationList';
import { ChatWindow } from './chat/ChatWindow';
import api from './utils/api';
import useWebSocket from 'react-use-websocket';
import { CreateGroupModal } from './chat/CreateGroupModal';
import { AddMemberModal } from './chat/AddMemberModal';
import { UpdateProfileModal } from './chat/UpdateProfileModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function ChatPage() {

  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState<any[]>([]);

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState({ id: "", name: "", avatar_url: "" });
  const [typingText, setTypingText] = useState("");

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);

  const membersRef = useRef<any[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : "";
  const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : "";

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      router.push('/auth');
    } else {

      setIsAuthLoading(false);
    }
  }, [router]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations');

      const formattedData = res.data.map((conv: any) => {
        const timeString = new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          id: conv.id,
          name: conv.title || "Phòng chat chưa đặt tên",
          lastMessage: "Bấm để xem tin nhắn...",
          time: timeString,
          avatar: conv.avatar_url,
          isOnline: false
        };
      });

      setConversations(formattedData);
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng chat:", error);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();

    try {
      // Lấy danh sách thành viên để kiểm tra quyền của mình
      const membersRes = await api.get(`/api/conversations/${id}/members`);
      const me = membersRes.data.find((m: any) => m.user_id === myUserId);
      const myRole = me?.group_role || 'MEMBER';
      const isAdmin = myRole === 'ADMIN';

      // Tùy biến thông báo dựa theo chức vụ
      const title = isAdmin ? "Xóa vĩnh viễn nhóm?" : "Thoát khỏi nhóm?";
      const text = isAdmin
        ? `Bạn là Quản trị viên. Bạn có chắc chắn muốn XÓA VĨNH VIỄN nhóm "${name}" không? Toàn bộ tin nhắn sẽ bị xóa.`
        : `Bạn có chắc chắn muốn THOÁT KHỎI nhóm "${name}" không?`;

      const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33'
      });

      // 3. Thực thi API tương ứng nếu xác nhận
      if (result.isConfirmed) {
        if (isAdmin) {
          // Xóa luôn cuộc hội thoại
          await api.delete(`/api/conversations/${id}`);
          toast.success("Đã xóa nhóm thành công!");
        } else {
          // Thoát khỏi cuộc hội thoại (Xóa thành viên)
          await api.delete(`/api/conversations/${id}/members/${myUserId}`);
          toast.success("Đã rời nhóm thành công!");
        }

        // Tải lại danh sách nhóm bên trái
        fetchConversations();

        // NẾU NHÓM ĐANG MỞ CHÍNH LÀ NHÓM VỪA BỊ XÓA -> TẮT KHUNG CHAT BÊN PHẢI ĐI
        if (activeChat.id === id) {
          setActiveChat({ id: "", name: "", avatar_url: "" });
          setMessages([]);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchConversations();
    }
  }, [isAuthLoading]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !activeChat.id) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const [res] = await Promise.all([
        api.get(`/api/messages/${activeChat.id}?page=${nextPage}&size=20`),
        new Promise(resolve => setTimeout(resolve, 1700))
      ]);

      if (res.data.length < 20) {
        setHasMore(false);
      }

      if (res.data.length > 0) {
        const olderMessages = res.data.reverse().map((msg: any) => {

          const isBot = msg.user_id === "2d61b0d1-1512-494b-ba1d-bf1c55de1173";

          const sender = membersRef.current.find((m: any) => m.user_id === msg.user_id);

          return {
            id: msg.id,
            content: msg.content,
            time: new Date(msg.created_at).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isMe: msg.user_id === myUserId,
            avatar: isBot ?
              "https://res.cloudinary.com/dccrvc4ok/image/upload/v1779908725/m7kwsxat7fvqithiqogt.png" :
              (sender?.avatar_url || (msg.user_id === myUserId ?
                "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp")),
            attachmentUrl: msg.attachment_url
          };
        });

        setMessages(prev => [...olderMessages, ...prev]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Lỗi tải thêm tin nhắn cũ:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectConversation = async (id: string, name: string, avatar: string) => {
    setActiveChat({ id, name, avatar_url: avatar });
    setIsMobileChatOpen(true);
    setOnlineUsers(new Set);

    setPage(0);
    setHasMore(true);
    setIsLoadingMore(false);

    // Gọi API lấy thành viên nhóm trước và lưu vào membersRef
    try {
      const membersRes = await api.get(`/api/conversations/${id}/members`);
      membersRef.current = membersRes.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách thành viên:", error);
      membersRef.current = [];
    }

    // Lấy danh sách tin nhắn và map avatar vào
    try {
      const res = await api.get(`/api/messages/${id}?page=0&size=20`);
      const historyMessages = res.data.reverse().map(
        (msg: any) => {
          const isBot = msg.user_id === "2d61b0d1-1512-494b-ba1d-bf1c55de1173";

          // TÌM KIẾM AVATAR TỪ DANH SÁCH THÀNH VIÊN
          const sender = membersRef.current.find((m: any) => m.user_id === msg.user_id);

          return {
            id: msg.id,
            content: msg.content,
            time: new Date(msg.created_at).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isMe: msg.user_id === myUserId,
            avatar: isBot ?
              "https://res.cloudinary.com/dccrvc4ok/image/upload/v1779908725/m7kwsxat7fvqithiqogt.png" :
              (sender?.avatar_url || (msg.user_id === myUserId ?
                "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp")),
            attachmentUrl: msg.attachment_url
          };
        }
      );
      if (res.data.length < 20) {
        setHasMore(false);
      }
      setMessages(historyMessages);
    } catch (error) {
      console.error("Lỗi lấy lịch sử tin nhắn:", error);
      setMessages([]);
    }

    try {
      const onlineRes = await api.get(`/api/conversations/${id}/online-users`);
      const otherOnlineUsers = onlineRes.data.filter((uid: string) => uid != myUserId);
      setOnlineUsers(new Set(otherOnlineUsers));
    } catch (error) {
      console.log("Lỗi không thể lấy danh sách online:", error);
    }
  };

  const socketUrl = activeChat.id ? `ws://localhost:8080/chat/${activeChat.id}?token=${token}` : null;

  const { sendMessage: sendWsMessage, lastJsonMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      const data: any = lastJsonMessage;

      if (data.type === "TYPING") {
        if (data.senderId !== myUserId) {
          if (data.senderId === "bot_charles") {
            setTypingText("Charles đang suy nghĩ...");
          } else {
            const sender = membersRef.current.find((m: any) => m.user_id === data.senderId);
            setTypingText(`${sender?.username || 'Ai đó'} đang gõ...`);
          }

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTypingText("");
          }, 2000);
        }
        return;
      }

      if (data.type === "CHAT" && data.user_id !== myUserId) {

        setTypingText("");
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        const isBot = data.user_id === "2d61b0d1-1512-494b-ba1d-bf1c55de1173";
        const sender = membersRef.current.find((m: any) => m.user_id === data.user_id);

        const incomingMsg = {
          id: data.id,
          content: data.content,
          time: new Date().toLocaleTimeString(),
          isMe: false,
          avatar: isBot
            ? "https://res.cloudinary.com/dccrvc4ok/image/upload/v1779908725/m7kwsxat7fvqithiqogt.png"
            : (sender?.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"),
          attachmentUrl: data.attachment_url
        };
        setMessages(prev => [...prev, incomingMsg]);
      }
    }
  }, [lastJsonMessage, myUserId]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // TÌM AVATAR CỦA CHÍNH MÌNH ĐỂ HIỂN THỊ KHI GỬI ĐI
    const me = membersRef.current.find((m: any) => m.user_id === myUserId);

    const optimisticMsg = {
      content: text,
      time: new Date().toLocaleTimeString(),
      isMe: true,
      avatar: me?.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
    };
    setMessages(prev => [...prev, optimisticMsg]);

    sendWsMessage(JSON.stringify({
      type: "CHAT",
      content: text
    }));
  };

  const handleTyping = () => {
    sendWsMessage(JSON.stringify({ type: "TYPING" }));
  };

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = response.data.url;
      const me = membersRef.current.find((m: any) => m.user_id === myUserId);

      setMessages(prev => [...prev, {
        content: "Đã gửi một ảnh", time: new Date().toLocaleTimeString(), isMe: true,
        avatar: me?.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp",
        attachmentUrl: fileUrl
      }]);

      sendWsMessage(JSON.stringify({
        type: "CHAT", content: "Đã gửi một ảnh", attachment_url: fileUrl
      }));
    } catch (error) {
      alert("Lỗi tải ảnh lên!");
    }
  };
  if (isAuthLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "#d6f0f4" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted small fw-bold">Đang xác thực tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="d-flex justify-content-center align-items-center vh-100 overflow-hidden"
      style={{ backgroundColor: "#d6f0f4" }}
    >
      <div
        className="w-100 h-100 p-0 p-md-4 d-flex justify-content-center"
        style={{ maxWidth: "1400px" }}
      >
        <div className="row h-100 w-100 g-3">

          <ConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            isMobileChatOpen={isMobileChatOpen}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenUpdateProfileModal={() => setShowUpdateProfileModal(true)}
            onDeleteConversation={handleDeleteConversation}
          />

          {activeChat.id ? (
            <ChatWindow
              messages={messages}
              typingText={typingText}
              myUserId={myUserId}
              activeChat={activeChat}
              onSendMessage={handleSendMessage}
              onlineCount={onlineUsers.size}
              onTyping={handleTyping}
              onUploadFile={handleUploadFile}
              isMobileChatOpen={isMobileChatOpen}
              onBackToList={() => setIsMobileChatOpen(false)}
              onLoadMore={loadMoreMessages}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              activeChatId={activeChat.id}
              showAddMemberModal={() => setOpenAddMemberModal(true)}
            />
          ) : (
            <div className={`col-12 col-md-7 col-lg-8 ${!isMobileChatOpen ? 'd-none d-md-block' : ''}`}>
              <div className="d-flex flex-column justify-content-center align-items-center 
              h-100 bg-white rounded-4 border shadow-sm">
                <div className="text-center text-muted">
                  <div className="mb-3">
                    <i className="fas fa-comments text-secondary" style={{ fontSize: "4rem", opacity: 0.5 }}></i>
                  </div>
                  <h4>Chào mừng đến với Chatify!</h4>
                  <p>Hãy chọn phòng chat để bắt đầu trò chuyện.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <CreateGroupModal
        show={showCreateModal}
        myUserId={myUserId || ""}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchConversations}
      />
      <AddMemberModal
        show={openAddMemberModal}
        myUserId={myUserId || ""}
        onClose={() => setOpenAddMemberModal(false)}
        activeChatId={activeChat.id}
      />
      <UpdateProfileModal
        show={showUpdateProfileModal}
        myUserId={myUserId || ""}
        onClose={() => setShowUpdateProfileModal(false)}
      />

    </section>
  );
}