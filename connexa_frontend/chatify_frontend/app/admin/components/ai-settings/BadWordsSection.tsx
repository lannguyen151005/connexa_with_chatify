"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { BadWordItem, BadWordSeverity, BadWordSettings } from './types';
import {
  addBadWordApi,
  removeBadWordApi,
  updateBadWordActionApi,
} from './aiSettingsService';

interface BadWordsSectionProps {
  initialSettings: BadWordSettings;
  onRefresh: () => void;
}

const CATEGORIES = [
  "Gian lận & Lừa đảo",
  "Tệ nạn xã hội",
  "Xúc phạm & Quấy rối",
  "Nội dung độc hại",
  "Khác",
];

export default function BadWordsSection({
  initialSettings,
  onRefresh,
}: BadWordsSectionProps) {
  const [settings, setSettings] = useState<BadWordSettings>(initialSettings);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newSeverity, setNewSeverity] = useState<BadWordSeverity>('HIGH');
  const [isAdding, setIsAdding] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Add new word
  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = newKeyword.trim().toLowerCase();
    if (!cleanWord) return;

    // Check duplicate
    if (settings.words.some((w) => w.keyword.toLowerCase() === cleanWord)) {
      toast.error("Từ khóa này đã tồn tại trong danh sách cấm!");
      return;
    }

    setIsAdding(true);
    try {
      const added = await addBadWordApi({
        keyword: cleanWord,
        severity: newSeverity,
        category: newCategory,
      });
      setSettings((prev) => ({
        ...prev,
        words: [added, ...prev.words],
      }));
      setNewKeyword('');
      toast.success(`Đã thêm từ cấm "${cleanWord}" vào danh sách!`);
      onRefresh();
    } catch (error) {
      toast.error("Lỗi khi thêm từ cấm!");
    } finally {
      setIsAdding(false);
    }
  };

  // Remove word
  const handleRemoveWord = async (item: BadWordItem) => {
    try {
      await removeBadWordApi(item.id);
      setSettings((prev) => ({
        ...prev,
        words: prev.words.filter((w) => w.id !== item.id),
      }));
      toast.success(`Đã gỡ bỏ từ cấm "${item.keyword}"`);
      onRefresh();
    } catch (error) {
      toast.error("Lỗi khi xóa từ cấm!");
    }
  };

  // Change action mode
  const handleChangeAction = async (newAction: BadWordSettings['action']) => {
    try {
      await updateBadWordActionApi(newAction);
      setSettings((prev) => ({ ...prev, action: newAction }));
      toast.success(
        newAction === 'FLAG_FOR_REVIEW'
          ? "Đã kích hoạt chế độ: Tự động tạo báo cáo chuyển đến Trung tâm Kiểm duyệt"
          : "Đã kích hoạt chế độ: Tự động ẩn nội dung khi vi phạm"
      );
      onRefresh();
    } catch (error) {
      toast.error("Lỗi khi đổi chế độ xử lý!");
    }
  };

  // Filtered words
  const filteredWords = settings.words.filter(
    (w) =>
      w.keyword.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      w.category.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* 1. Policy & Workflow Banner */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Bộ lọc Từ khóa Cấm & Kiểm duyệt Tự động
            </h3>
            <p className="text-xs text-slate-500">
              Quét tự động nội dung Bài viết (POST) và Bình luận (COMMENT) để phát hiện vi phạm
            </p>
          </div>
        </div>

        {/* Workflow Callout */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-slate-700">
              Cơ chế xử lý khi phát hiện nội dung chứa từ khóa cấm:
            </span>
            <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Phạm vi: Bài viết (POST) & Bình luận (COMMENT)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Option 1: FLAG_FOR_REVIEW */}
            <div
              onClick={() => handleChangeAction('FLAG_FOR_REVIEW')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                settings.action === 'FLAG_FOR_REVIEW'
                  ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <i className="fas fa-flag text-blue-600 text-xs"></i>
                  Tạo báo cáo vi phạm (Khuyến nghị)
                </span>
                {settings.action === 'FLAG_FOR_REVIEW' && (
                  <i className="fas fa-circle-check text-blue-600 text-sm"></i>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tự động tạo đơn tố cáo và gửi về <strong>Trung tâm Báo cáo (Bước 4)</strong> để Quản trị viên xem xét ngữ cảnh trước khi đưa ra quyết định kỷ luật.
              </p>
            </div>

            {/* Option 2: AUTO_HIDE */}
            <div
              onClick={() => handleChangeAction('AUTO_HIDE')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                settings.action === 'AUTO_HIDE'
                  ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <i className="fas fa-eye-slash text-amber-600 text-xs"></i>
                  Tự động ẩn ngay lập tức (Auto-Hide)
                </span>
                {settings.action === 'AUTO_HIDE' && (
                  <i className="fas fa-circle-check text-amber-600 text-sm"></i>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ẩn bài viết/bình luận ngay khi vừa đăng để ngăn chặn lan truyền nội dung độc hại (lưu ý có thể gây ẩn nhầm từ ngữ trích dẫn).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Add New Keyword Form */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-plus-circle text-blue-600"></i>
          Thêm Từ khóa cấm Mới
        </h4>

        <form onSubmit={handleAddWord} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Nhập từ hoặc cụm từ nhạy cảm (vd: lừa đảo, cờ bạc...)"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as BadWordSeverity)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            >
              <option value="HIGH">Mức độ: Cao</option>
              <option value="MEDIUM">Mức độ: Vừa</option>
              <option value="LOW">Mức độ: Thấp</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAdding || !newKeyword.trim()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="fas fa-plus text-[10px]"></i>
              <span>Thêm từ</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Keywords Pill Grid & Search */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách Từ khóa Cấm ({settings.words.length})
            </h4>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-xs w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Tìm nhanh từ khóa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Word Pills */}
        {filteredWords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Không tìm thấy từ khóa nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.severity === 'HIGH'
                      ? 'bg-rose-500'
                      : item.severity === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  title={`Mức độ: ${item.severity}`}
                />
                <span className="font-semibold text-slate-800">
                  {item.keyword}
                </span>
                <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200/60">
                  {item.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveWord(item)}
                  title={`Xóa từ cấm "${item.keyword}"`}
                  className="w-5 h-5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer text-[10px]"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
