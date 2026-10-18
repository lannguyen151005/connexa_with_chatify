"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardData } from './dashboard/types';
import { fetchDashboardData, isDashboardMockEnabled } from './dashboard/dashboardService';
import KpiCards from './dashboard/KpiCards';
import ActivityChart from './dashboard/ActivityChart';
import ContentDistribution from './dashboard/ContentDistribution';
import AiMonitorCard from './dashboard/AiMonitorCard';
import RecentReportsCard from './dashboard/RecentReportsCard';
import { AdminMenuTab } from '../types';

interface DashboardViewProps {
  onNavigateTab?: (tab: AdminMenuTab) => void;
}

export default function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchDashboardData();
      setData(res);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      // Khi không bật mock mà API lỗi: Báo lỗi thật, KHÔNG tự ý thay số liệu giả
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến Backend Quarkus (http://localhost:8080/api/admin/dashboard)."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Tự động làm mới mỗi 30 giây nếu đang chạy
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleNavigateReports = () => {
    if (onNavigateTab) {
      onNavigateTab('REPORTS');
    }
  };

  // 1. TRẠNG THÁI LOADING
  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-600">
          Đang đồng bộ số liệu Dashboard...
        </p>
        <span className="text-xs text-slate-400 mt-1">
          {isDashboardMockEnabled() ? "Đang tải dữ liệu mô phỏng..." : "Đang kết nối Backend Quarkus..."}
        </span>
      </div>
    );
  }

  // 2. TRẠNG THÁI LỖI (KHI KHÔNG BẬT MOCK VÀ API LỖI)
  if (errorMessage && !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xs max-w-2xl mx-auto my-8 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Lỗi đồng bộ dữ liệu Dashboard
        </h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100 font-mono text-left">
          {errorMessage}
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Chế độ Mock Data hiện đang <strong>TẮT</strong> (`NEXT_PUBLIC_ADMIN_DASHBOARD_MOCK=false`). Hệ thống không tự ý thay thế số liệu thật bằng số liệu giả.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={loadData}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fas fa-rotate-right"></i>
            Thử lại kết nối
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* THÔNG BÁO NGUỒN DỮ LIỆU / DEV MOCK BANNER */}
      {data.isMock && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-800">
            <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <i className="fas fa-vial"></i>
            </span>
            <div>
              <p className="font-bold text-amber-900 leading-snug">
                Chế độ Dữ liệu Mô phỏng (Dev Mock Mode)
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Các chỉ số mang nhãn <span className="font-bold">[Demo]</span> phục vụ thiết kế UI khi Backend Quarkus chưa chạy.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto border border-amber-200">
            NEXT_PUBLIC_ADMIN_DASHBOARD_MOCK=true
          </span>
        </div>
      )}

      {/* KHỐI 1: 4 THẺ KPI CHÍNH */}
      <KpiCards
        stats={data.stats}
        isMock={data.isMock}
        onNavigateReports={handleNavigateReports}
      />

      {/* KHỐI 2: BIỂU ĐỒ HOẠT ĐỘNG (8/12) & PHÂN BỔ NỘI DUNG (4/12) */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <ActivityChart data={data.chartData} isMock={data.isMock} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ContentDistribution items={data.contentDistribution} isMock={data.isMock} />
        </div>
      </div>

      {/* KHỐI 3: TRỢ LÝ AI CHARLES (6/12) & BÁO CÁO VI PHẠM KHẨN CẤP (6/12) */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <AiMonitorCard data={data.aiMonitor} isMock={data.isMock} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <RecentReportsCard
            reports={data.recentReports}
            isMock={data.isMock}
            onNavigateReports={handleNavigateReports}
          />
        </div>
      </div>
    </div>
  );
}