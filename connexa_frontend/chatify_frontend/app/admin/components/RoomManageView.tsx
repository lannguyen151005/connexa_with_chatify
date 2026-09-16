"use client";

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function RoomManageView() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/admin/rooms/list');
      setRooms(res.data);
    } catch (error) {
      toast.error("Lỗi đồng bộ dữ liệu phòng chat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    const result = await Swal.fire({
      title: 'Xóa vĩnh viễn?',
      text: `Phòng chat "${roomName}" sẽ bị xóa sạch!`,
      icon: 'error',
      showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/admin/rooms/${roomId}`);
        toast.success("Đã xóa phòng chat thành công!");
        fetchRooms();
      } catch (error) { toast.error("Lỗi khi xóa phòng chat!"); }
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="fade-in bg-white rounded-4 shadow-sm p-4 h-100">
      <h4 className="fw-bold text-dark mb-4 border-bottom pb-3">Danh sách Phòng Chat</h4>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Tên phòng</th>
              <th>Ngày tạo</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={room.avatar_url || "https://cdn-icons-png.flaticon.com/512/1256/1256650.png"} alt="" style={{width: '40px', height: '40px'}} className="rounded-circle shadow-sm" />
                    <span className="ms-3 fw-bold">{room.title}</span>
                  </div>
                </td>
                <td>{new Date(room.created_at).toLocaleDateString()}</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRoom(room.id, room.name)}>
                    <i className="fas fa-trash-alt me-1"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}