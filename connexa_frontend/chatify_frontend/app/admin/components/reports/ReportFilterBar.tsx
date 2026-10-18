"use client";

import React, { useEffect, useState } from 'react';
import { ReportFilterParams, ReportStatus, ReportTargetType } from './types';

interface ReportFilterBarProps {
  filterParams: ReportFilterParams;
  pendingCount: number;
  onFilterChange: (newParams: Partial<ReportFilterParams>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ReportFilterBar({
  filterParams,
  pendingCount,
  onFilterChange,
  onRefresh,
  isLoading,
}: ReportFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(filterParams.keyword || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filterParams.keyword) {
        onFilterChange({ keyword: searchTerm, page: 0 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, filterParams.keyword, onFilterChange]);

  const currentStatus = filterParams.status || 'PENDING';
  const currentTargetType = filterParams.targetType || 'ALL';

  const statusTabClass = (status: ReportStatus | 'ALL') => {
    const isSelected = currentStatus === status;
    return `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
      isSelected
        ? 'bg-blue-600 text-white shadow-xs'
        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
    }`;
  };

  const targetTypeClass = (type: ReportTargetType | 'ALL') => {
    const isSelected = currentTargetType === type;
    return `px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
      isSelected
        ? 'bg-slate-800 text-white shadow-2xs'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Search Bar + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, người báo cáo, hoặc nội dung..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <i className="fas fa-xmark text-xs"></i>
            </button>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer flex items-center gap-1.5 self-end sm:self-auto disabled:opacity-50"
          title="Làm mới danh sách báo cáo"
        >
          <i className={`fas fa-rotate-right ${isLoading ? 'animate-spin text-blue-600' : ''}`}></i>
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Row 1: Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          onClick={() => onFilterChange({ status: 'PENDING', page: 0 })}
          className={statusTabClass('PENDING')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Chờ xử lý</span>
          {pendingCount > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              currentStatus === 'PENDING' ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onFilterChange({ status: 'RESOLVED', page: 0 })}
          className={statusTabClass('RESOLVED')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Đã giải quyết</span>
        </button>

        <button
          onClick={() => onFilterChange({ status: 'DISMISSED', page: 0 })}
          className={statusTabClass('DISMISSED')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Đã bác bỏ</span>
        </button>

        <button
          onClick={() => onFilterChange({ status: 'ALL', page: 0 })}
          className={statusTabClass('ALL')}
        >
          <span>Tất cả</span>
        </button>
      </div>

      {/* Row 2: Target Type Filter */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
          Loại vi phạm:
        </span>
        <button
          onClick={() => onFilterChange({ targetType: 'ALL', page: 0 })}
          className={targetTypeClass('ALL')}
        >
          Tất cả
        </button>
        <button
          onClick={() => onFilterChange({ targetType: 'POST', page: 0 })}
          className={targetTypeClass('POST')}
        >
          <i className="fas fa-newspaper mr-1 text-[10px]"></i>
          Bài viết
        </button>
        <button
          onClick={() => onFilterChange({ targetType: 'COMMENT', page: 0 })}
          className={targetTypeClass('COMMENT')}
        >
          <i className="fas fa-comment mr-1 text-[10px]"></i>
          Bình luận
        </button>
        <button
          onClick={() => onFilterChange({ targetType: 'USER', page: 0 })}
          className={targetTypeClass('USER')}
        >
          <i className="fas fa-user mr-1 text-[10px]"></i>
          Tài khoản
        </button>
      </div>
    </div>
  );
}
