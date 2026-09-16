import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface UpdateProfileModalProps {
    show: boolean;
    onClose: () => void;
    myUserId: string;
}

export const UpdateProfileModal = ({ show, onClose, myUserId }: UpdateProfileModalProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Tự động tải thông tin hồ sơ hiện tại khi mở Modal
    useEffect(() => {
        if (show && myUserId) {
            const fetchCurrentProfile = async () => {
                try {
                    const res = await api.get(`/api/users/${myUserId}`);
                    if (res.data) {
                        setUsername(res.data.username || "");
                        setEmail(res.data.email || "");
                        if (res.data.avatar_url) {
                            setAvatarUrl(res.data.avatar_url);
                        } else {
                            setAvatarUrl("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp");
                        }
                        setPassword(res.data.password);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin tài khoản hiện tại:", error);
                }
            };
            fetchCurrentProfile();
        }
    }, [show, myUserId]);

    // Xử lý khi người dùng chọn một file ảnh đại diện mới
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Tạo đường dẫn tạm thời để hiển thị ảnh preview hình tròn ngay lập tức
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            return toast.error("Tên người dùng không được bỏ trống!");
        }

        setIsLoading(true);
        try {
            let finalAvatarUrl = avatarUrl; // Mặc định giữ nguyên ảnh cũ

            // 1. NẾU CÓ CHỌN ẢNH MỚI -> ĐẨY LÊN CLOUDINARY TRƯỚC BẰNG API CÓ SẴN
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append("file", avatarFile); 

                const uploadRes = await api.post('/api/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Lấy link Cloudinary trả về
                finalAvatarUrl = uploadRes.data.url;
            }

            // 2. GÓI DỮ LIỆU DẠNG JSON GỬI LÊN API CẬP NHẬT USER
            const payload: any = {
                username: username.trim(),
                email: email.trim(),
                avatar_url: finalAvatarUrl // Chuyền cái link URL thẳng lên Backend
            };

            if (oldPassword) {
                if (oldPassword === password) {
                    payload.password = newPassword;
                } else {
                    toast.success("Đổi mật khẩu thất bại!",
                        {
                            icon: (
                                <i className="fa-solid fa-triangle-exclamation text-warning"></i>
                            ),
                        }
                    )
                    return;
                }
            }else{
                payload.password = password;
            }


            // 3. GỌI API CẬP NHẬT
            const res = await api.put(`/api/users/${myUserId}`, payload);

            if (res.status === 200) {
                toast.success("Cập nhật thông tin tài khoản thành công!");
                setOldPassword("");
                setNewPassword("");
                setAvatarFile(null);
                onClose();

                // Tải lại trang sau 1 giây
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cập nhật thất bại!");
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
                            <i className="fas fa-user-cog text-primary me-2"></i>Hồ sơ cá nhân
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        <div className="modal-body px-4 pt-2">

                            {/* KHU VỰC HIỂN THỊ AVATAR HÌNH TRÒN VÀ USERNAME HIỆN TẠI */}
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

                                {/* Hiển thị tên tài khoản hiện tại ngay bên dưới ảnh đại diện */}
                                <h5 className="fw-bold text-dark mt-2 mb-0">{username || "Chưa đặt tên"}</h5>
                                <small className="text-muted text-break">{email || "Chưa cập nhật email"}</small>
                            </div>

                            {/* TRƯỜNG THAY ĐỔI USERNAME */}
                            <div className="form-group mb-3">
                                <label className="form-label small fw-bold text-secondary">Tên người dùng mới</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="fas fa-user text-muted"></i></span>
                                    <input
                                        type="text"
                                        className="form-control rounded-end-3 bg-light border-0"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Nhập tên hiển thị..."
                                    />
                                </div>
                            </div>

                            {/* TRƯỜNG THAY ĐỔI EMAIL (MỚI) */}
                            <div className="form-group mb-3">
                                <label className="form-label small fw-bold text-secondary">Địa chỉ Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="fas fa-envelope text-muted"></i></span>
                                    <input
                                        type="email"
                                        className="form-control rounded-end-3 bg-light border-0"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                            </div>

                            {/* KHU VỰC ĐỔI MẬT KHẨU (GIỮ NGUYÊN) */}
                            <div className="p-3 bg-light rounded-3 mb-2 mt-4">
                                <small className="text-muted d-block mb-2 fw-bold">
                                    <i className="fas fa-key me-1"></i> Đổi mật khẩu bảo mật (Bỏ trống nếu không đổi)
                                </small>

                                <div className="form-group mb-2">
                                    <input
                                        type="password"
                                        className="form-control bg-white border-0 small"
                                        placeholder="Mật khẩu hiện tại"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                </div>

                                <div className="form-group mb-1">
                                    <input
                                        type="password"
                                        className="form-control bg-white border-0 small"
                                        placeholder="Mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                            <button type="button" className="btn btn-light rounded-3 px-4 shadow-sm" onClick={onClose}>Hủy</button>
                            <button type="submit" className="btn btn-primary rounded-3 px-4 shadow-sm" disabled={isLoading}>
                                {isLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                Lưu cấu hình
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};