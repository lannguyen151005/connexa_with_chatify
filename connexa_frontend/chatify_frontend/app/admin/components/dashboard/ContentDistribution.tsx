"use client";

import React from 'react';
import { ContentDistributionItem } from './types';

interface ContentDistributionProps {
  items: ContentDistributionItem[];
  isMock: boolean;
}

export default function ContentDistribution({ items, isMock }: ContentDistributionProps) {
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-800">
              Cơ cấu Nội dung Bảng tin
            </h4>
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {totalCount.toLocaleString()} bài
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Phân bố định dạng bài đăng người dùng chia sẻ trên Connexa
        </p>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-6">
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              className="h-full transition-all duration-500"
              title={`${item.label}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Detailed List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </span>
                <span className="text-slate-800 font-bold">
                  {item.percentage}%{' '}
                  <span className="text-slate-400 font-normal">
                    ({item.count.toLocaleString()})
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Footer */}
      <div className="pt-5 mt-5 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-4 rounded-b-2xl">
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <i className="fas fa-lightbulb text-amber-500 mt-0.5 shrink-0"></i>
          <span>
            Nội dung có <strong>hình ảnh</strong> chiếm tỷ lệ cao nhất và thu hút tương tác gấp 3 lần bài viết văn bản thuần.
          </span>
        </div>
      </div>
    </div>
  );
}
