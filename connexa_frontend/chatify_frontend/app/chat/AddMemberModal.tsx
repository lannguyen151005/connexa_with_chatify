import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface User {
    id: string;
    username: string;
}

interface AddMemberProps {
    show: boolean;
    onClose: () => void;

    myUserId: string;
    activeChatId: string;
}

export const AddMemberModal = ({ show, onClose, myUserId ,activeChatId}: AddMemberProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    // Lấy danh sách tất cả người dùng để chọn
    useEffect(() => {
        if (show) {
            const fetchUsers = async () => {
                try {
                    const [usersRes, membersRes] = await Promise.all([
                        api.get('/api/users'),
                        api.get(`/api/conversations/${activeChatId}/members`)
                    ]);

                    const currrentMemberIds = new Set(membersRes.data.map((m: any) => m.user_id));

                    setUsers(usersRes.data.filter((u: User) => u.id !== myUserId && !currrentMemberIds.has(u.id)));
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

    const handleCreate = async () => {
        
        try {
            const res = await api.post(`/api/conversations/${activeChatId}/members`, {
                memberIds: Array.from(selectedUserIds)
            });
            if(res.data.length === 0){
                toast.success("Vui lòng chọn ít nhất 1 người!",{
                icon: (<i className="fa-solid fa-person-circle-exclamation text-warning"></i>)
            })
            return;
            }   
            onClose();   // Đóng modal
            toast.success("Thêm thành viên thành công!");
            setSelectedUserIds(new Set());
        } catch (error:any) {
            console.log(error.response);
            toast.error("Thêm thành viên thất bại!")
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 p-4">
                        <h5 className="modal-title fw-bold">Thêm thành viên</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body px-4 pb-4">
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
                        <button type="button" className="btn btn-primary rounded-3 px-4" onClick={handleCreate}>Thêm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};