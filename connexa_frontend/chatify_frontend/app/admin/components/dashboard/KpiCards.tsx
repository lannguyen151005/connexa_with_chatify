"use client";

import React from 'react';
import { KpiMetrics } from './types';

interface KpiCardsProps {
  stats: KpiMetrics;
  isMock: boolean;
  onNavigateReports?: () => void;
}

export default function KpiCards({ stats, isMock, onNavigateReports }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* CARD 1: TỔNG THÀNH VIÊN */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tổng Thành viên
          </span>
          <div className="flex items-center gap-1.5">
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.totalUsers.toLocaleString()}
          </h3>
          <span className="text-xs font-medium text-slate-400">người</span>
        </div>
        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
          <i className="fas fa-arrow-trend-up"></i>
          <span>{stats.usersGrowthText || "+12 hôm nay"}</span>
        </p>
      </div>

      {/* CARD 2: BÀI VIẾT BẢNG TIN */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bài viết trên Bảng tin
          </span>
          <div className="flex items-center gap-1.5">
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <i className="fas fa-newspaper"></i>
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.totalPosts.toLocaleString()}
          </h3>
          <span className="text-xs font-medium text-slate-400">bài đăng</span>
        </div>
        <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
          <i className="fas fa-arrow-trend-up"></i>
          <span>{stats.postsGrowthText || "+8.4% tuần này"}</span>
        </p>
      </div>

      {/* CARD 3: LƯỢT TƯƠNG TÁC XÃ HỘI */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Lượt Tương tác MXH
          </span>
          <div className="flex items-center gap-1.5">
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-lg">
              <i className="fas fa-heart"></i>
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.totalInteractions.toLocaleString()}
          </h3>
          <span className="text-xs font-medium text-slate-400">lượt</span>
        </div>
        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
          <span>Likes, Reactions & Bình luận</span>
        </p>
      </div>

      {/* CARD 4: BÁO CÁO VI PHẠM CHỜ XỬ LÝ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Báo cáo Chờ xử lý
          </span>
          <div className="flex items-center gap-1.5">
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              stats.pendingReports > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <i className="fas fa-shield-halved"></i>
            </div>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
              stats.pendingReports > 0 ? "text-rose-600" : "text-slate-800"
            }`}>
              {stats.pendingReports}
            </h3>
            <span className="text-xs font-medium text-slate-400">đơn chờ</span>
          </div>

          {stats.pendingReports > 0 && onNavigateReports && (
            <button
              onClick={onNavigateReports}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap border border-rose-100"
            >
              <span>Xử lý ngay</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          )}
        </div>

        <p className="text-xs font-medium flex items-center gap-1.5">
          {stats.pendingReports > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-rose-600 font-semibold">Cần giải quyết để an toàn MXH</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-600 font-semibold">Tất cả báo cáo đã được xử lý</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
