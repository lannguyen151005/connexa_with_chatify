"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CharlesAiConfig } from './types';
import { saveAiConfigApi, toggleBotStateApi } from './aiSettingsService';

interface AiConfigSectionProps {
  initialConfig: CharlesAiConfig;
  isMock: boolean;
  onRefresh: () => void;
}

export default function AiConfigSection({
  initialConfig,
  isMock,
  onRefresh,
}: AiConfigSectionProps) {
  const [config, setConfig] = useState<CharlesAiConfig>(initialConfig);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toggle Bot master switch (synced with /api/admin/bot/toggle)
  const handleToggle = async () => {
    setIsToggling(true);
    const nextState = !config.isBotEnabled;
    try {
      await toggleBotStateApi(nextState);
      setConfig((prev) => ({ ...prev, isBotEnabled: nextState }));
      toast.success(
        nextState
          ? "Đã kích hoạt Trợ lý Charles AI trên toàn hệ thống"
          : "Đã tạm dừng Trợ lý Charles AI"
      );
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái Bot!");
    } finally {
      setIsToggling(false);
    }
  };

  // Save AI Parameters
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await saveAiConfigApi({
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        dailyTokenLimit: config.dailyTokenLimit,
      });
      setConfig(updated);
      toast.success("Đã cập nhật cấu hình Trợ lý Charles AI thành công!");
      onRefresh();
    } catch (error) {
      toast.error("Lỗi lưu cấu hình AI!");
    } finally {
      setIsSaving(false);
    }
  };

  const tokenUsagePercent = Math.min(
    100,
    Math.round((config.tokensUsedToday / (config.dailyTokenLimit || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Master Switch & Connection Callout */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-800">
                Trợ lý Ảo Charles AI
              </h3>
              {(!config.isLiveConnected || isMock) ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <i className="fas fa-plug-circle-exclamation mr-1"></i>
                  Demo / Chưa kết nối thật
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Backend Quarkus
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {config.isBotEnabled
                ? "Bot đang hoạt động và sẵn sàng trả lời tự động tin nhắn từ sinh viên"
                : "Bot đang tạm dừng phục vụ; người dùng không thể nhắn tin với Charles AI"}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <span className="text-xs font-bold text-slate-700">
            {config.isBotEnabled ? "Đang Bật" : "Đã Tắt"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={config.isBotEnabled}
            disabled={isToggling}
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              config.isBotEnabled ? 'bg-blue-600' : 'bg-slate-300'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                config.isBotEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Token Metrics & Quota Monitor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Token consumption card with progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              Token tiêu thụ hôm nay
            </span>
            <span className="text-xs font-bold text-blue-600">
              {tokenUsagePercent}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 mb-2">
            {config.tokensUsedToday.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {config.dailyTokenLimit.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                tokenUsagePercent > 90
                  ? 'bg-rose-500'
                  : tokenUsagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${tokenUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Latency card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Độ trễ phản hồi trung bình
          </span>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xl font-extrabold text-emerald-600">
              ~{config.latencyMs}
            </span>
            <span className="text-xs text-slate-400 font-medium">mili-giây (ms)</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            <i className="fas fa-bolt mr-1"></i>Tốc độ xử lý luồng tối ưu
          </span>
        </div>

        {/* AI Service Host */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Mô hình AI đang kết nối
          </span>
          <span className="text-sm font-bold text-slate-800 block truncate mb-1">
            {config.modelName}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Quarkus AI Service • LangChain4j Integration
          </span>
        </div>
      </div>

      {/* 3. AI Tuning & Parameters Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-sliders text-blue-600"></i>
            Tham số Hành vi & Định hướng Prompt
          </h4>
          <span className="text-[11px] text-slate-400 italic">
            * Chỉ lưu khi Backend có API hỗ trợ hoặc chế độ Mock bật
          </span>
        </div>

        {/* System Prompt Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Câu lệnh Chỉ thị Cốt lõi (System Prompt / Persona)
            </label>
            <span className="text-[11px] text-slate-400">
              {config.systemPrompt.length} ký tự
            </span>
          </div>
          <textarea
            value={config.systemPrompt}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))
            }
            rows={4}
            className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 leading-relaxed resize-none"
            placeholder="Nhập định hướng tính cách, giọng điệu và giới hạn kiến thức cho Charles AI..."
          />
        </div>

        {/* Slider: Temperature & Max Tokens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Temperature */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Nhiệt độ Sáng tạo (Temperature)
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {config.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.temperature}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  temperature: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>0.0 (Chính xác / Logic)</span>
              <span>1.0 (Sáng tạo / Tự do)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Độ dài câu trả lời tối đa (Max Tokens)
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {config.maxTokens} tokens
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="4000"
              step="100"
              value={config.maxTokens}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxTokens: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>500 (Ngắn gọn)</span>
              <span>4,000 (Chi tiết / Bài luận)</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <i className="fas fa-check text-xs"></i>
                <span>Lưu Cấu hình Trợ lý AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
