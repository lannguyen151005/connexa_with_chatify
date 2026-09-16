import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface User {
    id: string;
    username: string;
}

interface CreateGroupModalProps {
    show: boolean;
    onClose: () => void;
    onCreated: () => void;
    myUserId: string;
}

export const CreateGroupModal = ({ show, onClose, onCreated, myUserId }: CreateGroupModalProps) => {
    const [title, setTitle] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp");
    const [isLoading, setIsLoading] = useState(false);


    // Lấy danh sách tất cả người dùng để chọn
    useEffect(() => {
        if (show) {
            const fetchUsers = async () => {
                try {
                    const res = await api.get('/api/users'); // Giả định backend có endpoint này
                    setUsers(res.data.filter((u: User) => u.id !== myUserId));
                } catch (error) {
                    console.error("Lỗi lấy danh sách người dùng:", error);
                }
            };
            fetchUsers();
        }
    }, [show, myUserId]);

    const handleSelectUser = (id: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Tạo đường dẫn tạm thời để hiển thị ảnh preview hình tròn ngay lập tức
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        if (selectedUserIds.size === 0) 
            return toast.error("Vui lòng chọn 1 người!");
            

        setIsLoading(true);
        try {
            let finalAvatarUrl = avatarUrl;
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append("file", avatarFile);

                const uploadRes = await api.post('/api/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Lấy link Cloudinary trả về
                finalAvatarUrl = uploadRes.data.url;
            }

            const res = await api.post('/api/conversations', {
                title: title || "Nhóm mới",
                memberIds: Array.from(selectedUserIds),
                avatar_url: finalAvatarUrl

            });

            if (res.status === 200) {
                toast.success("Tạo nhóm thành công!")
                setIsLoading(false);
                onCreated(); // Load lại danh sách phòng chat
                onClose();   // Đóng modal
                setTitle("");
                setSelectedUserIds(new Set());
            }
        } catch (error: any) {
            alert("Lỗi khi tạo nhóm chat!");
            console.log(error.response);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 p-4">
                        <h5 className="modal-title fw-bold">Tạo nhóm chat mới</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="text-center mb-4 position-relative">
                        <div className="position-relative d-inline-block">
                            <img
                                src={avatarUrl}
                                alt="User Avatar"
                                className="rounded-circle shadow border border-3 border-white"
                                style={{ width: '105px', height: '105px', objectFit: 'cover' }}
                            />
                            {/* Nút bấm nhỏ icon máy ảnh đè lên avatar để chọn file */}
                            <button
                                type="button"
                                className="btn btn-primary rounded-circle p-0 position-absolute d-flex justify-content-center align-items-center shadow-sm"
                                style={{ width: '32px', height: '32px', bottom: '0px', right: '0px' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="fas fa-camera" style={{ fontSize: '0.85rem' }}></i>
                            </button>
                        </div>
                        {/* Ẩn input file thực tế */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="modal-body px-4 pb-4">
                        <input
                            type="text"
                            className="form-control form-control-lg mb-3 rounded-3"
                            placeholder="Tên nhóm (tùy chọn)..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="input-group mb-3">
                            <span className="input-group-text bg-light border-end-0 rounded-start-3"><i className="fas fa-search"></i></span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0 rounded-end-3"
                                placeholder="Tìm bạn bè..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                <div
                                    key={user.id}
                                    className="d-flex align-items-center p-2 rounded-3 mb-1"
                                    style={{ cursor: 'pointer', backgroundColor: selectedUserIds.has(user.id) ? '#e3f2fd' : 'transparent' }}
                                    onClick={() => handleSelectUser(user.id)}
                                >
                                    <div className="flex-grow-1 ms-2 fw-medium">{user.username}</div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selectedUserIds.has(user.id)}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer border-top-0 px-4 pb-4">
                        <button type="button" className="btn btn-light rounded-3 px-4" onClick={onClose}>Hủy</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4" onClick={handleCreate} disabled={isLoading}>Tạo ngay</button>
                    </div>
                </div>
            </div>
        </div>
    );
};