"use client";

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function UserManageView() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users/list');
      setUsers(res.data);
    } catch (error) {
      toast.error("Lỗi đồng bộ dữ liệu người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (username === "Người dùng đã xóa") {
      toast.error("Người dùng này đã bị xóa từ trước rồi!"); return;
    }
    const result = await Swal.fire({
      title: 'Xóa tài khoản?',
      text: `Bạn có chắc muốn biến ${username} thành bóng ma không?`,
      icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        toast.success(`Đã xóa tài khoản thành công!`);
        fetchUsers();
      } catch (error) { toast.error("Thao tác thất bại!"); }
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="fade-in bg-white rounded-4 shadow-sm p-4 h-100">
      <h4 className="fw-bold text-dark mb-4 border-bottom pb-3">Danh sách Người dùng</h4>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={user.avatar_url || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"} alt="" style={{width: '40px', height: '40px'}} className="rounded-circle shadow-sm" />
                    <div className="ms-3">
                      <p className="fw-bold mb-1">{user.username}</p>
                      {user.role === 'ADMIN' && <span className="badge bg-primary">ADMIN</span>}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.username === "Người dùng đã xóa" ? (
                    <span className="badge bg-secondary rounded-pill px-3 py-2">Đã xóa</span>
                  ) : (
                    <span className="badge bg-success rounded-pill px-3 py-2">Hoạt động</span>
                  )}
                </td>   
                <td className="text-center">
                  {user.role !== 'ADMIN' && user.username !== "Người dùng đã xóa" && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(user.id, user.username)}>
                      <i className="fas fa-trash-alt me-1"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}