"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  AiSettingsSubTab,
  BadWordSettings,
  CharlesAiConfig,
  SystemAnnouncement,
} from './types';
import {
  fetchAiConfig,
  fetchAnnouncements,
  fetchBadWords,
  isAiSettingsMockEnabled,
} from './aiSettingsService';
import AiConfigSection from './AiConfigSection';
import BadWordsSection from './BadWordsSection';
import SystemAnnouncementSection from './SystemAnnouncementSection';

export default function AiSettingsView() {
  const [activeSubTab, setActiveSubTab] = useState<AiSettingsSubTab>('AI_BOT');
  const [aiConfig, setAiConfig] = useState<CharlesAiConfig | null>(null);
  const [badWords, setBadWords] = useState<BadWordSettings | null>(null);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMock = isAiSettingsMockEnabled();

  const loadAllSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [aiData, bwData, annData] = await Promise.all([
        fetchAiConfig(),
        fetchBadWords(),
        fetchAnnouncements(),
      ]);
      setAiConfig(aiData);
      setBadWords(bwData);
      setAnnouncements(annData);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Không thể đồng bộ dữ liệu Cấu hình Hệ thống & AI từ Backend. Vui lòng kiểm tra dịch vụ Quarkus hoặc bật chế độ Mock."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Dev Mock Banner */}
      {isMock && (
        <div className="px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <i className="fas fa-flask text-amber-600"></i>
            <span>
              <strong>Chế độ Mock Data (Dev):</strong> Đang sử dụng dữ liệu mẫu cho Trợ lý AI & Cài đặt hệ thống (NEXT_PUBLIC_ADMIN_AI_SETTINGS_MOCK=true).
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
            UI Prototype
          </span>
        </div>
      )}

      {/* Top Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-sliders text-blue-600"></i>
            Trợ lý AI & Cài đặt Toàn Hệ thống
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hành vi Charles AI, danh mục từ khóa nhạy cảm và kênh phát thanh sinh viên
          </p>
        </div>

        {/* Sub-Tabs Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full shrink-0 flex-wrap">
          <button
            onClick={() => setActiveSubTab('AI_BOT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'AI_BOT'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-robot text-[11px] text-amber-600"></i>
            <span>Trợ lý Charles AI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BAD_WORDS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'BAD_WORDS'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-shield-halved text-[11px] text-rose-600"></i>
            <span>Bộ lọc Từ cấm</span>
            {badWords && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {badWords.words.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('ANNOUNCEMENTS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ANNOUNCEMENTS'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-bullhorn text-[11px] text-blue-600"></i>
            <span>Thông báo Toàn sàn</span>
            {announcements.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {announcements.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Render */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">
            Đang tải dữ liệu cấu hình hệ thống & AI...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-rose-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Không thể tải cấu hình AI & Hệ thống
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {errorMessage}
          </p>
          <button
            onClick={loadAllSettings}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <i className="fas fa-rotate"></i>
            <span>Thử lại</span>
          </button>
        </div>
      ) : (
        <div>
          {activeSubTab === 'AI_BOT' && aiConfig && (
            <AiConfigSection
              initialConfig={aiConfig}
              isMock={isMock}
              onRefresh={loadAllSettings}
            />
          )}

          {activeSubTab === 'BAD_WORDS' && badWords && (
            <BadWordsSection
              initialSettings={badWords}
              onRefresh={loadAllSettings}
            />
          )}

          {activeSubTab === 'ANNOUNCEMENTS' && (
            <SystemAnnouncementSection
              initialAnnouncements={announcements}
              onRefresh={loadAllSettings}
            />
          )}
        </div>
      )}
    </div>
  );
}
