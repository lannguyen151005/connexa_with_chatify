"use client";

import React, { useEffect, useState } from 'react';
import { RoomStatus, RoomType } from './types';

interface RoomFilterBarProps {
  search: string;
  type: 'ALL' | RoomType;
  status: 'ALL' | RoomStatus;
  onSearchChange: (val: string) => void;
  onTypeChange: (val: 'ALL' | RoomType) => void;
  onStatusChange: (val: 'ALL' | RoomStatus) => void;
  onReset: () => void;
  groupCount?: number;
  directCount?: number;
}

export default function RoomFilterBar({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onReset,
  groupCount,
  directCount,
}: RoomFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Synchronize when external reset occurs
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Hàng 1: Ô tìm kiếm và nút Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tên phòng, nhóm hoặc người sáng lập..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-xs transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Nút Đặt lại bộ lọc */}
        {(search || type !== 'ALL' || status !== 'ALL') && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <i className="fas fa-rotate-left"></i>
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Hàng 2: Bộ lọc Type & Status dạng Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Filter Type (Nhóm / Chat 1-1) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1.5">Phân loại:</span>
          <button
            onClick={() => onTypeChange('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              type === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onTypeChange('GROUP')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              type === 'GROUP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-users text-[10px]"></i>
            <span>Nhóm trò chuyện</span>
            {groupCount !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                type === 'GROUP' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {groupCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTypeChange('DIRECT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              type === 'DIRECT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-user-group text-[10px]"></i>
            <span>Chat riêng (1-1)</span>
            {directCount !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                type === 'DIRECT' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {directCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Status (Hoạt động / Đã đóng) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1.5">Trạng thái:</span>
          <button
            onClick={() => onStatusChange('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              status === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onStatusChange('ACTIVE')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              status === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Hoạt động</span>
          </button>
          <button
            onClick={() => onStatusChange('CLOSED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              status === 'CLOSED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Đã đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
