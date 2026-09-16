import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface UpdateGroupModalProps {
  show: boolean;
  onClose: () => void;
  activeChat: { id: string; name: string; avatar_url?: string };
}

export const UpdateGroupModal = ({ show, onClose, activeChat }: UpdateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Điền sẵn thông tin nhóm hiện tại vào Form mỗi khi mở Modal
  useEffect(() => {
    if (show && activeChat) {
      setGroupName(activeChat.name || "");
      if (activeChat.avatar_url) {
        setAvatarUrl(activeChat.avatar_url);
      } else {
        setAvatarUrl("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp");
      }
    }
  }, [show, activeChat]);

  // Xử lý khi chọn ảnh mới từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Hiển thị ảnh preview ngay lập tức
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      return toast.error("Tên nhóm không được bỏ trống!");
    }

    setIsLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Nếu có chọn ảnh mới -> Đẩy lên API Cloudinary trước
      if (avatarFile) {
        const uploadData = new FormData();
        uploadData.append("file", avatarFile);
        
        const uploadRes = await api.post('/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalAvatarUrl = uploadRes.data.url; 
      }

      // 2. Gọi API cập nhật thông tin nhóm (Tên nhóm & Avatar)
      const res = await api.put(`/api/conversations/${activeChat.id}`, {
        title: groupName.trim(),
        avatar_url: finalAvatarUrl
      });

      if (res.status === 200) {
        toast.success("Cập nhật thông tin nhóm thành công!");
        setAvatarFile(null);
        onClose();
        
        // Tải lại trang sau 1 giây để đồng bộ toàn bộ tên/ảnh nhóm ở cột trái và khung chat
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Cập nhật thất bại! Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-sliders-h text-primary me-2"></i>Tùy chỉnh nhóm
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleUpdateGroup}>
            <div className="modal-body px-4 pt-2">
              
              {/* KHU VỰC HIỂN THỊ AVATAR NHÓM */}
              <div className="text-center mb-4 position-relative">
                <div className="position-relative d-inline-block">
                  <img 
                    src={avatarUrl} 
                    alt="Group Avatar" 
                    className="rounded-circle shadow border border-3 border-white"
                    style={{ width: '105px', height: '105px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary rounded-circle p-0 position-absolute d-flex justify-content-center align-items-center shadow-sm"
                    style={{ width: '32px', height: '32px', bottom: '0px', right: '0px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-camera" style={{ fontSize: '0.85rem' }}></i>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                <h5 className="fw-bold text-dark mt-2 mb-0">{groupName || "Chưa đặt tên"}</h5>
              </div>

              {/* TRƯỜNG THAY ĐỔI TÊN NHÓM */}
              <div className="form-group mb-4">
                <label className="form-label small fw-bold text-secondary">Tên nhóm mới</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><i className="fas fa-users text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control rounded-end-3 bg-light border-0" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nhập tên nhóm..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
              <button type="button" className="btn btn-light rounded-3 px-4 shadow-sm" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn btn-primary rounded-3 px-4 shadow-sm" disabled={isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};