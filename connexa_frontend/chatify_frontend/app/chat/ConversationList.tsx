import React, { useEffect, useState } from 'react';
import { ConversationItem } from './items/ConversationItem';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

interface ConversationListProps {
  conversations: any[];
  onSelectConversation: (id: string, name: string, avatar: string) => void;
  isMobileChatOpen: boolean;
  onOpenCreateModal: () => void;
  onOpenUpdateProfileModal: () => void;
  onDeleteConversation: (e: React.MouseEvent, id: string, name: string) => void;
}

export const ConversationList = ({ conversations, onSelectConversation, isMobileChatOpen, onOpenCreateModal, onOpenUpdateProfileModal, onDeleteConversation }: ConversationListProps) => {
  // State quản lý việc mở/đóng Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.groups.includes('ADMIN')) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Lỗi đọc token:", error);
      }
    }
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {

    const result = await Swal.fire(
      {
        title: "Đăng xuất?",
        icon: 'question',
        text: "Bạn chắc chắn muốn thoát chứ?",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy"
      }
    );

    if (result.isConfirmed) {
      // Xóa sạch thông tin phiên đăng nhập
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_id");

      toast.success("Đăng xuất thành công!");

      router.push("/login");
    }
  };

  return (
    <div className={`col-12 col-md-5 col-lg-4 h-100 ${isMobileChatOpen ? 'd-none d-md-block' : ''}`}>
      <div className="d-flex flex-column h-100 bg-white rounded-4 shadow-sm overflow-hidden">

        {/* HEADER: Chứa nút Menu 3 gạch và thanh tìm kiếm */}
        <div className="p-3 border-bottom d-flex align-items-center gap-2 position-relative">

          {/* NÚT MENU 3 GẠCH */}
          <button
            className="btn btn-light rounded-4 shadow-sm flex-shrink-0 d-flex justify-content-center align-items-center"
            style={{ width: '40px', height: '40px' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className="fas fa-bars text-secondary"></i>
          </button>

          {/* MENU SỔ XUỐNG (DROPDOWN) */}
          {isMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1040 }}
                onClick={() => setIsMenuOpen(false)}
              ></div>

              <ul
                className="dropdown-menu show shadow-sm border-0 rounded-3"
                style={{ position: 'absolute', top: '65px', left: '15px', zIndex: 1050 }}
              >
                <li>
                  <button className="dropdown-item py-2" onClick={() => { setIsMenuOpen(false); onOpenUpdateProfileModal(); }}>
                    <i className="fas fa-user-edit me-3 text-primary"></i>
                    Thay đổi thông tin
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2" onClick={() => { setIsMenuOpen(false); onOpenCreateModal(); }}>
                    <i className="fas fa-users me-3 text-success"></i>
                    Tạo nhóm mới
                  </button>
                </li>
                {/* NÚT TRANG QUẢN TRỊ - CHỈ HIỆN KHI LÀ ADMIN */}
                {isAdmin && (
                  <li>
                    <button 
                      className="dropdown-item py-2 fw-bold text-warning" 
                      onClick={() => { setIsMenuOpen(false); router.push('/admin'); }}
                    >
                      <i className="fas fa-user-shield me-3"></i>
                      Trang Quản Trị
                    </button>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-3"></i>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </>
          )}

          {/* THANH TÌM KIẾM */}
          <div className="input-group rounded flex-grow-1">
            <input type="search" className="form-control rounded bg-light border-0" placeholder="Tìm kiếm..." />
            <span className="input-group-text border-0 bg-light"><i className="fas fa-search text-muted"></i></span>
          </div>

        </div>

        {/* DANH SÁCH PHÒNG CHAT */}
        <div className="flex-grow-1" style={{ overflowY: "auto" }}>
          <ul className="list-unstyled mb-0">
            {conversations.map((conv, index) => (
              <div key={index} onClick={() => onSelectConversation(conv.id, conv.name, conv.avatar)} style={{ cursor: "pointer" }}>
                <ConversationItem {...conv} isActive={isMobileChatOpen} onDelete={onDeleteConversation} />
              </div>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};