"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AiMonitorData } from './types';
import { toggleBotStateApi } from './dashboardService';

interface AiMonitorCardProps {
  data: AiMonitorData;
  isMock: boolean;
}

export default function AiMonitorCard({ data, isMock }: AiMonitorCardProps) {
  const [isEnabled, setIsEnabled] = useState(data.isBotEnabled);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const nextState = !isEnabled;
      await toggleBotStateApi(nextState);
      setIsEnabled(nextState);
      toast.success(
        nextState
          ? "Đã kích hoạt Trợ lý Charles AI"
          : "Đã tạm dừng Trợ lý Charles AI"
      );
    } catch (error) {
      toast.error("Không thể kết nối đến Backend Quarkus để đổi trạng thái Bot!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Trợ lý AI Charles
              </h4>
              <p className="text-xs text-slate-500">
                Giám sát tình trạng phản hồi và mức tiêu hao token
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          {(!data.isLiveConnected || isMock) ? (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <i className="fas fa-plug-circle-exclamation mr-1"></i>
              Demo / Chưa kết nối thật
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Backend
            </span>
          )}
        </div>

        {/* Status Callout Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 my-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              Trạng thái phục vụ người dùng
            </span>
            <span className="text-xs text-slate-500">
              {isEnabled
                ? "Bot đang sẵn sàng trả lời tự động trên toàn hệ thống"
                : "Bot đã tạm dừng tiếp nhận câu hỏi"}
            </span>
          </div>

          {/* Tailwind Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            disabled={isUpdating}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Token đã sử dụng hôm nay
            </span>
            <span className="text-lg font-extrabold text-slate-800">
              {data.botTokensUsed.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Hạn mức: 50,000 / ngày
            </span>
          </div>

          <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">
              Độ trễ phản hồi API
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-emerald-600">
                ~{data.latencyMs}
              </span>
              <span className="text-xs font-medium text-slate-400">ms</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Tốc độ tối ưu
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <i className="fas fa-shield text-slate-400"></i>
          Mô hình: Quarkus AI Service (Chatify)
        </span>
        <span className="text-[11px] text-slate-400">
          Tự động đồng bộ mỗi 30s
        </span>
      </div>
    </div>
  );
}
