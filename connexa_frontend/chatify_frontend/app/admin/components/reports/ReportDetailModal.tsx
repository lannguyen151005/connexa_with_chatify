"use client";

import React, { useState } from 'react';
import { AdminReport, ReportActionTaken } from './types';

interface ReportDetailModalProps {
  report: AdminReport | null;
  onClose: () => void;
  onResolve: (report: AdminReport, action: 'REMOVE_CONTENT' | 'WARN_USER', note: string) => void;
  onDismiss: (report: AdminReport, note: string) => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onResolve,
  onDismiss,
}: ReportDetailModalProps) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!report) return null;

  const targetBadge = (type: AdminReport['targetType']) => {
    switch (type) {
      case 'POST':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5">
            <i className="fas fa-newspaper"></i> Bài viết
          </span>
        );
      case 'COMMENT':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
            <i className="fas fa-comment"></i> Bình luận
          </span>
        );
      case 'USER':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
            <i className="fas fa-user"></i> Tài khoản
          </span>
        );
    }
  };

  const handleResolveAction = async (action: 'REMOVE_CONTENT' | 'WARN_USER') => {
    setIsSubmitting(true);
    await onResolve(report, action, resolutionNote);
    setIsSubmitting(false);
  };

  const handleDismissAction = async () => {
    setIsSubmitting(true);
    await onDismiss(report, resolutionNote);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg">
              #{report.id}
            </span>
            {targetBadge(report.targetType)}
            <h3 className="text-sm font-bold text-slate-800">
              Kiểm tra Báo cáo Vi phạm
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="fas fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Reporter & Violator Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Người báo cáo */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Người gửi khiếu nại:
              </span>
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    report.reporter.avatarUrl ||
                    "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                  }
                  alt={report.reporter.username}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    @{report.reporter.username}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Gửi: {new Date(report.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Đối tượng bị tố cáo */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-2">
                Tác giả bị tố cáo:
              </span>
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    report.targetAuthor?.avatarUrl ||
                    "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                  }
                  alt={report.targetAuthor?.username || 'Unknown'}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    @{report.targetAuthor?.username || 'Tài khoản ẩn danh'}
                  </h4>
                  <span className="text-[10px] text-rose-600 font-semibold">
                    Lý do: {report.reasonText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Violated Content Evidence */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <i className="fas fa-quote-left text-blue-500"></i>
              Bằng chứng nội dung bị tố cáo:
            </span>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 italic leading-relaxed">
              "{report.targetSummary}"
            </div>
            {report.details && (
              <p className="text-xs text-slate-500 pt-1">
                <strong>Ghi chú của người gửi:</strong> {report.details}
              </p>
            )}
          </div>

          {/* Historical Resolution (if already solved) */}
          {report.status !== 'PENDING' && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              report.status === 'RESOLVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <i className={`fas ${report.status === 'RESOLVED' ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-slate-400'}`}></i>
                  {report.status === 'RESOLVED' ? 'Đã giải quyết vi phạm' : 'Đã bác bỏ khiếu nại'}
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {report.resolvedAt && new Date(report.resolvedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="text-xs">
                <strong>Biện pháp:</strong>{' '}
                {report.actionTaken === 'REMOVE_CONTENT' && 'Đã gỡ bỏ nội dung vi phạm (Xóa mềm).'}
                {report.actionTaken === 'WARN_USER' && 'Đã gửi cảnh cáo trực tiếp đến tài khoản.'}
                {report.actionTaken === 'DISMISSED' && 'Không áp dụng biện pháp (Báo cáo sai).'}
              </p>
              {report.resolutionNote && (
                <p className="text-[11px] text-slate-600 italic">
                  "{report.resolutionNote}"
                </p>
              )}
            </div>
          )}

          {/* Resolution Decision Tools (Only when PENDING) */}
          {report.status === 'PENDING' && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Ghi chú xử lý của Quản trị viên (tùy chọn):
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Nhập lý do xử lý hoặc ghi chú nghiệp vụ..."
                rows={2}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          {report.status === 'PENDING' ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* Option 1: Remove content */}
              <button
                disabled={isSubmitting}
                onClick={() => handleResolveAction('REMOVE_CONTENT')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <i className="fas fa-trash-can text-[11px]"></i>
                <span>Gỡ nội dung vi phạm</span>
              </button>

              {/* Option 2: Warn user */}
              <button
                disabled={isSubmitting}
                onClick={() => handleResolveAction('WARN_USER')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <i className="fas fa-triangle-exclamation text-[11px]"></i>
                <span>Cảnh cáo tài khoản</span>
              </button>

              {/* Option 3: Dismiss report */}
              <button
                disabled={isSubmitting}
                onClick={handleDismissAction}
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <i className="fas fa-ban text-[11px]"></i>
                <span>Bác bỏ khiếu nại</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">
              Vụ việc đã được xử lý xong và lưu vết trong hệ thống.
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
