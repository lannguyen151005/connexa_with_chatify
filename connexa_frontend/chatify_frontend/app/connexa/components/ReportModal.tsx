"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  REPORT_REASON_OPTIONS,
  submitReport,
  UserReportReason,
  UserReportTargetType,
} from "../services/ReportService";

interface ReportModalProps {
  isOpen: boolean;
  targetType: UserReportTargetType;
  targetId: string;
  previewText?: string;
  onClose: () => void;
}

export default function ReportModal({
  isOpen,
  targetType,
  targetId,
  previewText,
  onClose,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<UserReportReason>("SPAM");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetLabel =
    targetType === "POST"
      ? "bài viết"
      : targetType === "COMMENT"
      ? "bình luận"
      : "tài khoản";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await submitReport({
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });
      toast.success("Đã gửi báo cáo tới Quản trị viên. Cảm ơn bạn đã đóng góp!");
      setDetails("");
      setSelectedReason("SPAM");
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const msg =
        apiError?.response?.data?.message ||
        "Không thể gửi báo cáo. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <i className="fas fa-flag text-sm" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Báo cáo {targetLabel} vi phạm
              </h3>
              <p className="text-[11px] text-slate-500">
                Thông tin báo cáo được bảo mật và chuyển cho Quản trị viên xem xét
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-600"
            aria-label="Đóng"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {previewText && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs italic text-slate-600 line-clamp-2">
              &ldquo;{previewText}&rdquo;
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Chọn lý do vi phạm:
            </label>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {REPORT_REASON_OPTIONS.map((option) => {
                const active = selectedReason === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedReason(option.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-left transition ${
                      active
                        ? "border-rose-400 bg-rose-50/70 ring-2 ring-rose-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {option.label}
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          active
                            ? "border-rose-500 bg-rose-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {active && <i className="fas fa-check text-[9px]" />}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mô tả chi tiết (không bắt buộc):
            </label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Cung cấp thêm ngữ cảnh giúp quản trị viên xử lý nhanh hơn..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-hidden transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane" />
                  <span>Gửi báo cáo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

