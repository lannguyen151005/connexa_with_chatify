"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { AnnouncementSeverity, AnnouncementStatus, SystemAnnouncement } from './types';
import {
  deleteAnnouncementApi,
  saveAnnouncementApi,
} from './aiSettingsService';

interface SystemAnnouncementSectionProps {
  initialAnnouncements: SystemAnnouncement[];
  onRefresh: () => void;
}

export default function SystemAnnouncementSection({
  initialAnnouncements,
  onRefresh,
}: SystemAnnouncementSectionProps) {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState<AnnouncementSeverity>('INFO');
  const [status, setStatus] = useState<AnnouncementStatus>('ACTIVE');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'ADMINS'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSeverity('INFO');
    setStatus('ACTIVE');
    setTargetAudience('ALL');
    setIsModalOpen(true);
  };

  const openEditModal = (ann: SystemAnnouncement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setSeverity(ann.severity);
    setStatus(ann.status);
    setTargetAudience(ann.targetAudience);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const saved = await saveAnnouncementApi({
        id: editingId || undefined,
        title: title.trim(),
        content: content.trim(),
        severity,
        status,
        targetAudience,
        expiresAt: null,
      });

      if (editingId) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? saved : a))
        );
        toast.success("Đã cập nhật thông báo hệ thống!");
      } else {
        setAnnouncements((prev) => [saved, ...prev]);
        toast.success("Đã phát thanh thông báo hệ thống mới!");
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      toast.error("Lỗi khi lưu thông báo hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ann: SystemAnnouncement) => {
    const confirm = await Swal.fire({
      title: "Xóa thông báo này?",
      text: `Thông báo "${ann.title}" sẽ bị gỡ bỏ vĩnh viễn khỏi toàn bộ hệ thống!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa thông báo",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteAnnouncementApi(ann.id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== ann.id));
        toast.success("Đã xóa thông báo thành công!");
        onRefresh();
      } catch (error) {
        toast.error("Lỗi khi xóa thông báo!");
      }
    }
  };

  const handleToggleStatus = async (ann: SystemAnnouncement) => {
    const nextStatus: AnnouncementStatus = ann.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const updated = await saveAnnouncementApi({
        ...ann,
        status: nextStatus,
      });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? updated : a))
      );
      toast.success(
        nextStatus === 'ACTIVE'
          ? "Đã kích hoạt phát sóng thông báo"
          : "Đã chuyển thông báo sang bản nháp"
      );
      onRefresh();
    } catch (error) {
      toast.error("Lỗi khi đổi trạng thái thông báo!");
    }
  };

  // Find active broadcast for live preview
  const activeAnnouncement = announcements.find((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* 1. Live Preview of Active Announcement */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-bullhorn text-blue-600"></i>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mô phỏng Hiển thị Thực tế (Live Banner Preview)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Hiển thị trên đầu bảng tin của sinh viên
          </span>
        </div>

        {activeAnnouncement ? (
          <div
            className={`p-4 rounded-2xl border transition-all ${
              activeAnnouncement.severity === 'URGENT'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : activeAnnouncement.severity === 'WARNING'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-base shrink-0">
                <i
                  className={`fas ${
                    activeAnnouncement.severity === 'URGENT'
                      ? 'fa-circle-radiation text-rose-600'
                      : activeAnnouncement.severity === 'WARNING'
                      ? 'fa-triangle-exclamation text-amber-600'
                      : 'fa-circle-info text-blue-600'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-bold text-sm">
                    {activeAnnouncement.title}
                  </h5>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.2 rounded-full bg-white/80 border border-current">
                    {activeAnnouncement.severity}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {activeAnnouncement.content}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl text-center text-xs text-slate-400">
            Hiện không có thông báo nào đang ở trạng thái <strong>Phát sóng (Active)</strong>.
          </div>
        )}
      </div>

      {/* 2. Announcements List */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách Thông báo Toàn sàn ({announcements.length})
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Phát thông tin bảo trì, thông điệp nhà trường hoặc sự kiện sinh viên
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <i className="fas fa-plus text-[10px]"></i>
            <span>Tạo thông báo mới</span>
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có thông báo nào được tạo.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                      ann.severity === 'URGENT'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <i
                      className={`fas ${
                        ann.severity === 'URGENT'
                          ? 'fa-radiation'
                          : ann.severity === 'WARNING'
                          ? 'fa-triangle-exclamation'
                          : 'fa-bullhorn'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-xs font-bold text-slate-800 truncate">
                        {ann.title}
                      </h5>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase ${
                          ann.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ann.status === 'ACTIVE' ? 'Đang phát sóng' : 'Bản nháp'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleStatus(ann)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                      ann.status === 'ACTIVE'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {ann.status === 'ACTIVE' ? 'Tạm dừng' : 'Phát sóng'}
                  </button>

                  <button
                    onClick={() => openEditModal(ann)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-pen text-[11px]"></i>
                  </button>

                  <button
                    onClick={() => handleDelete(ann)}
                    className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <i className="fas fa-trash text-[11px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingId ? "Chỉnh sửa Thông báo Hệ thống" : "Tạo Thông báo Hệ thống Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Tiêu đề thông báo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bảo trì hệ thống định kỳ..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Nhập nội dung thông điệp gửi tới sinh viên và thành viên..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mức độ nghiêm trọng
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as AnnouncementSeverity)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  >
                    <option value="INFO">INFO (Thông tin chung - Xanh dương)</option>
                    <option value="WARNING">WARNING (Cảnh báo - Vàng cam)</option>
                    <option value="URGENT">URGENT (Khẩn cấp - Đỏ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Trạng thái phát sóng
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  >
                    <option value="ACTIVE">Phát sóng ngay (Active)</option>
                    <option value="DRAFT">Lưu bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check text-xs"></i>
                      <span>{editingId ? "Cập nhật" : "Tạo thông báo"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
