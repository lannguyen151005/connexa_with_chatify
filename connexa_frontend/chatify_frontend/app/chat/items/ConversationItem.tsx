import React from 'react';

interface ConversationItemProps {
  id: string; // Thêm id để truyền lên hàm xóa
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  isOnline: boolean;
  isActive?: boolean;
  onDelete?: (e: React.MouseEvent, id: string, name: string) => void; 
}

export const ConversationItem = ({ id, name, lastMessage, time, avatar, isOnline, isActive, onDelete }: ConversationItemProps) => {
  return (
    <li className={`p-2 border-bottom ${isActive ? 'bg-light' : ''}`} style={{ transition: "background-color 0.2s" }}>
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center w-100">
          <div className="position-relative">
            <img
              src={avatar || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"}
              alt="avatar"
              className="rounded-circle shadow-sm"
              style={{ width: "45px", height: "45px", objectFit: "cover" }}
            />
            {isOnline && (
              <span 
                className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" 
                style={{ width: "12px", height: "12px", transform: "translate(-10%, -10%)" }}
              ></span>
            )}
          </div>
          <div className="pt-1 ms-3 flex-grow-1 overflow-hidden">
            <p className="fw-bold mb-0 text-truncate text-dark">{name}</p>
            <p className="small text-muted mb-0 text-truncate">{lastMessage}</p>
          </div>

          <div className="d-flex flex-column align-items-end ms-2">
            <p className="small text-muted mb-1">{time}</p>
            
            {onDelete && (
              <button 
                className="btn btn-sm btn-link text-danger p-0 mt-1" 
                onClick={(e) => onDelete(e, id, name)}
                title="Xóa/Thoát nhóm"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};