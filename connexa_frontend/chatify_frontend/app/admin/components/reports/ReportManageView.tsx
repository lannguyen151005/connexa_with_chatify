"use client";

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { AdminReport, PaginatedReportsResponse, ReportFilterParams } from './types';
import {
  dismissReportApi,
  fetchAdminReports,
  isReportsMockEnabled,
  resolveReportApi,
} from './reportService';
import ReportFilterBar from './ReportFilterBar';
import ReportTable from './ReportTable';
import ReportDetailModal from './ReportDetailModal';

interface ReportManageViewProps {
  onPendingCountChange?: (count: number) => void;
}

export default function ReportManageView({ onPendingCountChange }: ReportManageViewProps) {
  const [data, setData] = useState<PaginatedReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

  const [filterParams, setFilterParams] = useState<ReportFilterParams>({
    page: 0,
    size: 6,
    status: 'PENDING',
    targetType: 'ALL',
    keyword: '',
  });

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchAdminReports(filterParams);
      setData(res);
      if (onPendingCountChange) {
        onPendingCountChange(res.pendingCount);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách báo cáo:", err);
      // Khi không bật mock: hiện lỗi thật, không tự ý nạp mock data
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến API Backend Quarkus (/api/admin/reports)."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, onPendingCountChange]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFilterChange = (newParams: Partial<ReportFilterParams>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Hành động: Giải quyết vi phạm (Gỡ nội dung hoặc Cảnh cáo)
  const handleResolve = async (
    report: AdminReport,
    action: 'REMOVE_CONTENT' | 'WARN_USER',
    note: string
  ) => {
    const actionLabel =
      action === 'REMOVE_CONTENT' ? 'Gỡ nội dung vi phạm (Xóa mềm)' : 'Gửi cảnh cáo đến tài khoản';

    const result = await Swal.fire({
      title: 'Xác nhận xử lý vi phạm?',
      text: `Áp dụng biện pháp: "${actionLabel}" cho vụ việc #${report.id}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'REMOVE_CONTENT' ? '#e11d48' : '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý thi hành',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
        cancelButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
      },
    });

    if (result.isConfirmed) {
      try {
        const updated = await resolveReportApi(report.id, { action, note });
        if (updated) {
          toast.success(`Đã xử lý xong báo cáo #${report.id}!`);
          setSelectedReport(null);
          loadReports();
        }
      } catch (error) {
        toast.error("Lỗi khi gửi quyết định xử lý báo cáo!");
      }
    }
  };

  // Hành động: Bác bỏ khiếu nại (Dismiss)
  const handleDismiss = async (report: AdminReport, note: string) => {
    const result = await Swal.fire({
      title: 'Bác bỏ đơn khiếu nại?',
      text: `Đơn #${report.id} sẽ được đánh dấu là không vi phạm tiêu chuẩn cộng đồng.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#64748b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xác nhận bác bỏ',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
        cancelButton: 'rounded-full px-5 py-2.5 font-bold text-xs',
      },
    });

    if (result.isConfirmed) {
      try {
        const updated = await dismissReportApi(report.id, { note });
        if (updated) {
          toast.success(`Đã bác bỏ đơn khiếu nại #${report.id}!`);
          setSelectedReport(null);
          loadReports();
        }
      } catch (error) {
        toast.error("Lỗi khi bác bỏ đơn khiếu nại!");
      }
    }
  };

  const isMock = isReportsMockEnabled();

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* 1. DEV MOCK BANNER */}
      {isMock && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-800">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <i className="fas fa-shield-halved"></i>
            </span>
            <div>
              <p className="font-bold text-amber-900 leading-snug">
                Chế độ Dữ liệu Mẫu Báo cáo Vi phạm (Dev Mock Mode)
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Các khiếu nại mẫu (Spam, Lừa đảo, Quấy rối) phục vụ thiết kế UI. Thao tác xử phạt được đồng bộ sang bài viết tại chỗ.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto border border-amber-200">
            NEXT_PUBLIC_ADMIN_REPORTS_MOCK=true
          </span>
        </div>
      )}

      {/* 2. HEADER TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Trung tâm Xử lý Báo cáo Vi phạm
            </h2>
            {isMock && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận khiếu nại từ cộng đồng, thẩm định bằng chứng và thi hành các biện pháp chế tài
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Đang chờ xử lý: <strong className="text-rose-900">{data.pendingCount}</strong> đơn
            </span>
          </div>
        )}
      </div>

      {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
      <ReportFilterBar
        filterParams={filterParams}
        pendingCount={data?.pendingCount ?? 0}
        onFilterChange={handleFilterChange}
        onRefresh={loadReports}
        isLoading={isLoading}
      />

      {/* 4. VÙNG DỮ LIỆU CHÍNH */}

      {/* 4.1 TRẠNG THÁI LOADING */}
      {isLoading && !data && (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center bg-white rounded-2xl border border-slate-200/80 p-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-slate-700">Đang tải danh sách báo cáo...</p>
          <span className="text-xs text-slate-400 mt-1">
            {isMock ? "Đang chuẩn bị dữ liệu mô phỏng..." : "Đang kết nối Backend Quarkus..."}
          </span>
        </div>
      )}

      {/* 4.2 TRẠNG THÁI LỖI */}
      {errorMessage && !data && (
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xs max-w-2xl mx-auto text-center my-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Lỗi kết nối API Báo cáo Vi phạm
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100 font-mono text-left">
            {errorMessage}
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Cờ `NEXT_PUBLIC_ADMIN_REPORTS_MOCK=false`. Hệ thống đang chờ kết nối Backend thật.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadReports}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <i className="fas fa-rotate-right"></i>
              Thử lại kết nối
            </button>
          </div>
        </div>
      )}

      {/* 4.3 TRẠNG THÁI DANH SÁCH RỖNG */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fas fa-shield-halved"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Không có báo cáo vi phạm nào
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Không tìm thấy lá đơn khiếu nại nào theo bộ lọc hoặc từ khóa hiện tại.
          </p>
          <button
            onClick={() => handleFilterChange({ keyword: '', status: 'ALL', targetType: 'ALL', page: 0 })}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-all cursor-pointer"
          >
            Xem tất cả báo cáo
          </button>
        </div>
      )}

      {/* 4.4 TRẠNG THÁI THÀNH CÔNG: BẢNG DỮ LIỆU */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          <ReportTable
            reports={data.items}
            onInspect={(rep) => setSelectedReport(rep)}
          />

          {/* Phân trang */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{data.page * data.size + 1}</strong> -{' '}
              <strong className="text-slate-800">
                {Math.min((data.page + 1) * data.size, data.totalElements)}
              </strong>{' '}
              trên tổng số <strong className="text-slate-800">{data.totalElements}</strong> vụ việc
            </span>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                disabled={data.page === 0}
                onClick={() => handleFilterChange({ page: data.page - 1 })}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <i className="fas fa-chevron-left text-[10px]"></i>
                <span className="hidden sm:inline">Trước</span>
              </button>

              <div className="flex items-center gap-1 px-2 font-bold text-slate-700">
                <span>{data.page + 1}</span>
                <span className="text-slate-400">/</span>
                <span>{data.totalPages}</span>
              </div>

              <button
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => handleFilterChange({ page: data.page + 1 })}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="hidden sm:inline">Sau</span>
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL XEM XÉT VÀ PHÁN QUYẾT BÁO CÁO */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
