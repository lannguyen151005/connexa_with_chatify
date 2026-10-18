"use client";

import React from 'react';
import { RecentReportItem } from './types';

interface RecentReportsCardProps {
  reports: RecentReportItem[];
  isMock: boolean;
  onNavigateReports?: () => void;
}

export default function RecentReportsCard({
  reports,
  isMock,
  onNavigateReports,
}: RecentReportsCardProps) {
  const targetBadge = (type: RecentReportItem['targetType']) => {
    switch (type) {
      case 'POST':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            Bài viết
          </span>
        );
      case 'COMMENT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
            Bình luận
          </span>
        );
      case 'USER':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
            Tài khoản
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-800">
                  Báo cáo Vi phạm Khẩn cấp
                </h4>
                {isMock && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Các khiếu nại gần nhất từ người dùng cần kiểm duyệt
              </p>
            </div>
          </div>

          {onNavigateReports && (
            <button
              onClick={onNavigateReports}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-blue-100 shadow-2xs"
            >
              <span>Xem tất cả</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          )}
        </div>

        {/* Reports List */}
        <div className="divide-y divide-slate-100 mt-3">
          {reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <i className="fas fa-check-circle text-emerald-500 text-xl mb-2 block"></i>
              Hiện không có báo cáo vi phạm nào đang chờ xử lý.
            </div>
          ) : (
            reports.slice(0, 3).map((rep) => (
              <div key={rep.id} className="py-3 flex items-start gap-3 first:pt-2 last:pb-1">
                <img
                  src={rep.reporterAvatar || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"}
                  alt={rep.reporterName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      @{rep.reporterName}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {rep.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {targetBadge(rep.targetType)}
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50/70 px-2 py-0.5 rounded-md">
                      {rep.reason}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{rep.targetSummary}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <i className="fas fa-circle-info text-slate-400"></i>
          Ưu tiên xử lý báo cáo đồi trụy và quấy rối
        </span>
        {onNavigateReports && (
          <button
            onClick={onNavigateReports}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Mở Trung tâm Báo cáo &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
