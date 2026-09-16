import React, { useEffect, useRef, useState } from 'react';
import { MessageItem } from './items/MessageItem';
import { ChatInput } from './ChatInput';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { GroupMembersModal } from './GroupMembersModal';
import { useRouter } from 'next/navigation';
import { UpdateGroupModal } from './UpdateGroupModal'; // Thêm dòng này

interface ChatWindowProps {
  messages: any[];
  typingText: string;
  activeChat: { id: string, name: string, avatar_url: string };
  onSendMessage: (text: string) => void;
  onTyping: () => void;
  onUploadFile: (file: File) => void;
  isMobileChatOpen: boolean;
  onBackToList: () => void;
  onlineCount?: number;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  activeChatId?: string;
  myUserId: string | null;
  showAddMemberModal: () => void;
}

export const ChatWindow = ({
  messages, typingText, activeChat, onSendMessage, onTyping,
  onUploadFile, isMobileChatOpen, onBackToList, onlineCount,
  onLoadMore, hasMore, isLoadingMore, activeChatId, myUserId,
  showAddMemberModal
}: ChatWindowProps) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const lastMsgIdRef = useRef<string | number | undefined>(undefined);
  const prevChatNameRef = useRef<string>("");

  // Các State mới để quản lý Menu thông tin và Modal thành viên
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const hasNewMessage = lastMessage?.id !== lastMsgIdRef.current || !lastMessage?.id;
    const isNewChat = activeChat.name !== prevChatNameRef.current;

    if (isNewChat || hasNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: isNewChat ? "auto" : "smooth" });
    }

    lastMsgIdRef.current = lastMessage?.id;
    prevChatNameRef.current = activeChat.name;
  }, [messages, typingText, activeChat]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !isLoadingMore) {
      const oldScrollHeight = target.scrollHeight;
      await onLoadMore();
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const newScrollHeight = scrollContainerRef.current.scrollHeight;
          scrollContainerRef.current.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }, 30);
    }
  };

  const handleExitGroup = async () => {
    try {
      setIsInfoMenuOpen(false);
      const result = await Swal.fire(
        {
          title: "Thoát nhóm?",
          icon: 'question',
          text: "Bạn chắc chắn muốn rời khỏi nhóm chứ?",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy"
        }
      );
      if (result.isConfirmed) {
        const res = await api.delete(`/api/conversations/${activeChatId}/members/${myUserId}`);
        if (res.status === 200) {
          toast.success("Đã thoát nhóm thành công!");
          setTimeout(
            () => {
              window.location.reload();
            }, 1000
          )
        }
      }
    } catch (error: any) {
      console.log(error.response);
      toast.error("Thoát nhóm thất bại!");
    }
  }

  return (
    <div className={`col-12 col-md-7 col-lg-8 h-100 ${!isMobileChatOpen ? 'd-none d-md-block' : ''}`}>
      <div className="d-flex flex-column h-100 bg-white rounded-4 shadow-sm overflow-hidden border">

        {/* HEADER (Hiện trên cả Mobile và PC) */}
        <div className="d-flex align-items-center p-3 border-bottom bg-light position-relative">
          <button className="btn btn-sm btn-outline-secondary me-3 d-md-none" onClick={onBackToList}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className='d-flex'>
            <img
              src={activeChat.avatar_url}
              alt="avatar"
              className="rounded-circle shadow-sm align-self-start"
              style={{ width: "45px", height: "45px", objectFit: "cover" }}
            />
            <div className='px-2'>
              <h5 className="mb-0 fw-bold">{activeChat.name}</h5>
            {onlineCount && onlineCount > 0 ? (
              <small className="text-success fw-bold d-flex align-items-center">
                <span className="bg-success rounded-circle me-1" style={{ width: "8px", height: "8px", display: "inline-block" }}></span>
                {onlineCount === 1 ? "Đang hoạt động" : `${onlineCount + 1} người đang hoạt động`}
              </small>
            ) : (
              <small className="text-muted d-flex align-items-center">
                <span className="bg-secondary rounded-circle me-1" style={{ width: "8px", height: "8px", display: "inline-block" }}></span>
                Ngoại tuyến
              </small>
            )}
            </div>
          </div>

          <div className="ms-auto position-relative d-flex align-items-center">
            <button
              className="btn btn-link text-secondary p-0"
              onClick={() => setIsInfoMenuOpen(!isInfoMenuOpen)}
              style={{ fontSize: "1.3rem" }}
            >
              <i className="fas fa-info-circle"></i>
            </button>

            {/* DROPDOWN MENU THÔNG TIN */}
            {isInfoMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
                  onClick={() => setIsInfoMenuOpen(false)}
                ></div>
                <ul
                  className="dropdown-menu show shadow-sm border-0 rounded-3"
                  style={{ position: 'absolute', top: '35px', right: '0px', left: 'auto', zIndex: 1050, minWidth: '160px' }}
                >
                  <li>
                    <button className="dropdown-item py-2" onClick={() => { setIsInfoMenuOpen(false); setShowUpdateGroupModal(true) }}>
                      <i className="fas fa-sliders-h me-3 text-primary"></i> Tùy chỉnh nhóm
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item py-2" onClick={() => { setIsInfoMenuOpen(false); setShowMembersModal(true); }}>
                      <i className="fas fa-users me-3 text-success"></i> Thành viên
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger fw-bold" onClick={handleExitGroup}>
                      <i className="fa-solid fa-door-open me-3"></i>Rời khỏi nhóm
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* BONG BÓNG TIN NHẮN */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-3 flex-grow-1"
          style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
        >
          {isLoadingMore && (
            <div className="text-center my-2 text-muted small d-flex align-items-center justify-content-center">
              <div className="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
              Đang tải tin nhắn cũ hơn...
            </div>
          )}

          {messages.map((msg, index) => (
            <MessageItem key={index} {...msg} />
          ))}
          {typingText && (
            <div className="text-muted small ms-3 mt-2 font-italic d-flex align-items-center">
               <div className="spinner-grow spinner-grow-sm text-secondary me-2" role="status" style={{width: '0.8rem', height: '0.8rem'}}></div>
               {typingText}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ô NHẬP TIN NHẮN */}
        <div className="mt-auto bg-white border-top">
          <ChatInput onSendMessage={onSendMessage} onTyping={onTyping} onUploadFile={onUploadFile} />
        </div>

      </div>


      <GroupMembersModal
        show={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        activeChatId={activeChatId || ""}
        openAddMemberModal={() => showAddMemberModal()}
      />
      <UpdateGroupModal
        show={showUpdateGroupModal}
        onClose={() => setShowUpdateGroupModal(false)}
        activeChat={activeChat}
      />
    </div>
  );
};


