"use client";

import React, { useEffect, useState } from 'react';
import { UserFilterParams, UserRole, UserStatus } from './types';

interface UserFilterBarProps {
  filterParams: UserFilterParams;
  onFilterChange: (newParams: Partial<UserFilterParams>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function UserFilterBar({
  filterParams,
  onFilterChange,
  onRefresh,
  isLoading,
}: UserFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(filterParams.keyword || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filterParams.keyword) {
        onFilterChange({ keyword: searchTerm, page: 0 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, filterParams.keyword, onFilterChange]);

  const currentStatus = filterParams.status || 'ALL';
  const currentRole = filterParams.role || 'ALL';

  const statusTabClass = (status: UserStatus | 'ALL') => {
    const isSelected = currentStatus === status;
    return `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
      isSelected
        ? 'bg-blue-600 text-white shadow-xs'
        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
    }`;
  };

  const roleTabClass = (role: UserRole | 'ALL') => {
    const isSelected = currentRole === role;
    return `px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
      isSelected
        ? 'bg-slate-800 text-white shadow-2xs'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Search Input + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo @username hoặc địa chỉ email..."
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
          title="Làm mới danh sách người dùng"
        >
          <i className={`fas fa-rotate-right ${isLoading ? 'animate-spin text-blue-600' : ''}`}></i>
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Row 1: Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          onClick={() => onFilterChange({ status: 'ALL', page: 0 })}
          className={statusTabClass('ALL')}
        >
          <span>Tất cả</span>
        </button>

        <button
          onClick={() => onFilterChange({ status: 'ACTIVE', page: 0 })}
          className={statusTabClass('ACTIVE')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Hoạt động</span>
        </button>

        <button
          onClick={() => onFilterChange({ status: 'LOCKED', page: 0 })}
          className={statusTabClass('LOCKED')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Đang bị khóa</span>
        </button>

        <button
          onClick={() => onFilterChange({ status: 'DELETED', page: 0 })}
          className={statusTabClass('DELETED')}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Đã xóa</span>
        </button>
      </div>

      {/* Row 2: Role Filter */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
          Vai trò:
        </span>
        <button
          onClick={() => onFilterChange({ role: 'ALL', page: 0 })}
          className={roleTabClass('ALL')}
        >
          Tất cả
        </button>
        <button
          onClick={() => onFilterChange({ role: 'USER', page: 0 })}
          className={roleTabClass('USER')}
        >
          <i className="fas fa-user mr-1 text-[10px]"></i>
          Thành viên (User)
        </button>
        <button
          onClick={() => onFilterChange({ role: 'ADMIN', page: 0 })}
          className={roleTabClass('ADMIN')}
        >
          <i className="fas fa-shield mr-1 text-[10px] text-blue-500"></i>
          Quản trị viên (Admin)
        </button>
      </div>
    </div>
  );
}
