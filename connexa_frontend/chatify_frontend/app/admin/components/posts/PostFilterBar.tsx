"use client";

import React, { useEffect, useState } from 'react';
import { PostFilterParams, PostModerationStatus } from './types';

interface PostFilterBarProps {
  filterParams: PostFilterParams;
  onFilterChange: (newParams: Partial<PostFilterParams>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function PostFilterBar({
  filterParams,
  onFilterChange,
  onRefresh,
  isLoading,
}: PostFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(filterParams.keyword || '');

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filterParams.keyword) {
        onFilterChange({ keyword: searchTerm, page: 0 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, filterParams.keyword, onFilterChange]);

  const activeTab = filterParams.pinnedOnly
    ? 'PINNED'
    : (filterParams.status || 'ALL');

  const handleSelectTab = (tab: PostModerationStatus | 'ALL' | 'PINNED') => {
    if (tab === 'PINNED') {
      onFilterChange({ pinnedOnly: true, status: 'ALL', page: 0 });
    } else {
      onFilterChange({ pinnedOnly: false, status: tab, page: 0 });
    }
  };

  const pillClass = (tab: PostModerationStatus | 'ALL' | 'PINNED') => {
    const isSelected = activeTab === tab;
    return `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
      isSelected
        ? 'bg-blue-600 text-white shadow-xs'
        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
    }`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung bài viết hoặc @username..."
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

        {/* Action Button: Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Làm mới danh sách bài viết"
          >
            <i className={`fas fa-rotate-right ${isLoading ? 'animate-spin text-blue-600' : ''}`}></i>
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          onClick={() => handleSelectTab('ALL')}
          className={pillClass('ALL')}
        >
          <span>Tất cả bài viết</span>
        </button>

        <button
          onClick={() => handleSelectTab('ACTIVE')}
          className={pillClass('ACTIVE')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Đang hiển thị</span>
        </button>

        <button
          onClick={() => handleSelectTab('FLAGGED')}
          className={pillClass('FLAGGED')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Bị báo cáo vi phạm</span>
        </button>

        <button
          onClick={() => handleSelectTab('HIDDEN')}
          className={pillClass('HIDDEN')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Đã ẩn</span>
        </button>

        <button
          onClick={() => handleSelectTab('PINNED')}
          className={pillClass('PINNED')}
        >
          <i className="fas fa-thumbtack text-[11px] text-amber-500"></i>
          <span>Đã ghim</span>
        </button>
      </div>
    </div>
  );
}
