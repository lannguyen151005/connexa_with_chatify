import { useEffect, useState } from "react";
import api from "../utils/api";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface GroupMembersModalProps {
  show: boolean;
  onClose: () => void;
  activeChatId: string;
  openAddMemberModal: () => void;
}

export const GroupMembersModal = ({ show, onClose, activeChatId , openAddMemberModal}: GroupMembersModalProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const myUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : "";

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/conversations/${activeChatId}/members`);
      setMembers(res.data); // 
    } catch (error) {
      console.error("Lỗi lấy danh sách thành viên:", error);
    }
  };

  useEffect(() => {
    if (show && activeChatId) {
      fetchMembers();
    }
  }, [show, activeChatId]);

  const handleKick = async (userId: string) => {

    const result = await Swal.fire(
      {
        title: "Xóa thành viên?",
        text: "Bạn chắc chắn muốn xóa thành viên khỏi nhóm chứ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy"
      }
    );

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/api/conversations/${activeChatId}/members/${userId}`);
        if (res.status === 200) {
          toast.success("Đã xóa thành viên khỏi nhóm!");
          fetchMembers();
        }
      } catch (error: any) {
        console.log(error.response);
        toast.error("Không thể xóa thành viên khỏi nhóm!");
      }
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      const res = await api.put(`/api/conversations/${activeChatId}/members/${userId}/role`, { role: 'MODERATOR' });

      if (res.status === 200) {
        toast.success("Thăng quyền thành công!");
        fetchMembers();
      }
    } catch (error: any) {
      console.log(error.response);
      toast.error("Thăng quyền thất bại!");
    }
  };

  const handleAddMember = () => {
    onClose();
    openAddMemberModal();
  }

  if (!show) return null;

  // Tìm kiếm vai trò của chính người dùng hiện tại trong nhóm này
  const myRole = members.find(m => m.user_id === myUserId)?.group_role || "MEMBER";
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header p-4 border-bottom-1">
            <h5 className="modal-title fw-bold"><i className="fas fa-users-cog me-2 text-secondary"></i>Thành viên nhóm</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 pb-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <ul className="list-group list-group-flush">
              {members.map((member) => {
                const isMe = member.user_id === myUserId;
                return (
                  <li key={member.user_id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-bottom-0">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle d-flex justify-content-center align-items-center fw-bold text-secondary shadow-sm" style={{ width: '38px', height: '38px' }}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ms-3">
                        <span className="fw-semibold text-dark">{member.username}</span>
                        {isMe && <span className="text-muted small ms-1">(Bạn)</span>}
                        <div>
                          <span className={`badge mt-1 ${member.group_role === 'ADMIN' ? 'bg-danger' : member.role === 'MODERATOR' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                            {member.group_role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {!isMe && (
                        <>
                          {myRole === 'ADMIN' && (
                            <>
                              {member.group_role === 'MEMBER' && (
                                <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => handlePromote(member.user_id)}>
                                  <i className="fas fa-user-shield me-1"></i> +Mod
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-danger rounded-3" onClick={() => handleKick(member.user_id)}>
                                <i className="fas fa-user-times"></i> Kick
                              </button>
                            </>
                          )}

                          {myRole === 'MODERATOR' && member.group_role === 'MEMBER' && (
                            <button className="btn btn-sm btn-outline-danger rounded-3" onClick={() => handleKick(member.user_id)}>
                              <i className="fas fa-user-times"></i> Kick
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="modal-body px-4 pb-4">
            <button className="form-control btn btn-primary round-4" onClick={handleAddMember}>
              <i className="fa-solid fa-user-plus me-2"></i>Thêm thành viên
            </button>
          </div>
          <div className="modal-footer border-top-0 px-4 pb-4">
            <button type="button" className="btn btn-light rounded-3 px-4 shadow-sm" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};