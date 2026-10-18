"use client";

import React from 'react';
import { AdminReport, ReportStatus } from './types';

interface ReportTableProps {
  reports: AdminReport[];
  onInspect: (report: AdminReport) => void;
}

export default function ReportTable({ reports, onInspect }: ReportTableProps) {
  const targetBadge = (type: AdminReport['targetType']) => {
    switch (type) {
      case 'POST':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Bài viết
          </span>
        );
      case 'COMMENT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            Bình luận
          </span>
        );
      case 'USER':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Tài khoản
          </span>
        );
    }
  };

  const statusBadge = (report: AdminReport) => {
    switch (report.status) {
      case 'PENDING':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Chờ xử lý
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <i className="fas fa-check text-[10px] text-emerald-600"></i>
            {report.actionTaken === 'REMOVE_CONTENT' ? 'Đã gỡ bài' : 'Đã cảnh cáo'}
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
            <i className="fas fa-ban text-[10px] text-slate-400"></i>
            Đã bác bỏ
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[200px]">Người tố cáo</th>
              <th className="py-3.5 px-4">Đối tượng & Bằng chứng vi phạm</th>
              <th className="py-3.5 px-4 w-[170px]">Lý do vi phạm</th>
              <th className="py-3.5 px-4 w-[150px] text-center">Trạng thái</th>
              <th className="py-3.5 px-4 w-[130px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. NGƯỜI TỐ CÁO */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={
                        report.reporter.avatarUrl ||
                        "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                      }
                      alt={report.reporter.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-800 truncate block">
                        @{report.reporter.username}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                        #{report.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. ĐỐI TƯỢNG & BẰNG CHỨNG */}
                <td className="py-3.5 px-4 align-top">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {targetBadge(report.targetType)}
                      {report.targetAuthor && (
                        <span className="text-[11px] font-semibold text-slate-600">
                          Tác giả: <strong className="text-slate-900">@{report.targetAuthor.username}</strong>
                        </span>
                      )}
                    </div>

                    <p
                      onClick={() => onInspect(report)}
                      className="text-xs text-slate-700 italic line-clamp-2 leading-relaxed cursor-pointer hover:text-blue-600 transition-colors"
                      title={report.targetSummary}
                    >
                      "{report.targetSummary}"
                    </p>
                  </div>
                </td>

                {/* 3. LÝ DO VI PHẠM */}
                <td className="py-3.5 px-4 align-top">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      {report.reasonText}
                    </span>
                    {report.details && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                        {report.details}
                      </p>
                    )}
                  </div>
                </td>

                {/* 4. TRẠNG THÁI */}
                <td className="py-3.5 px-4 align-middle text-center">
                  {statusBadge(report)}
                </td>

                {/* 5. THAO TÁC */}
                <td className="py-3.5 px-4 align-middle text-right">
                  <button
                    onClick={() => onInspect(report)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5 ${
                      report.status === 'PENDING'
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{report.status === 'PENDING' ? 'Xử lý' : 'Chi tiết'}</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
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
