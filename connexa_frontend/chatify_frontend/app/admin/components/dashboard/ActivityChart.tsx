"use client";

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ActivityDataPoint } from './types';

interface ActivityChartProps {
  data: ActivityDataPoint[];
  isMock: boolean;
}

export default function ActivityChart({ data, isMock }: ActivityChartProps) {
  const [activeMetric, setActiveMetric] = useState<'SOCIAL' | 'MESSAGES'>('SOCIAL');

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs h-full flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-800">
              Lưu lượng Hoạt động Hệ thống
            </h4>
            {isMock && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biến động bài viết, tương tác xã hội và tin nhắn chat
          </p>
        </div>

        {/* Metric Switcher Button Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full shrink-0 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveMetric('SOCIAL')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeMetric === 'SOCIAL'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-heart text-[11px] mr-1.5 text-pink-500"></i>
            Mạng xã hội
          </button>
          <button
            onClick={() => setActiveMetric('MESSAGES')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeMetric === 'MESSAGES'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-comments text-[11px] mr-1.5 text-emerald-500"></i>
            Tin nhắn Chat
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                      <p className="font-bold text-slate-300 pb-1 border-b border-slate-800">{label}</p>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name === 'interactions' && 'Tương tác (Like/Cmt)'}
                            {entry.name === 'posts' && 'Bài viết mới'}
                            {entry.name === 'messages' && 'Tin nhắn chat'}
                          </span>
                          <span className="font-extrabold text-white">
                            {Number(entry.value).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            {activeMetric === 'SOCIAL' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="interactions"
                  name="interactions"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorInteractions)"
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  name="posts"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPosts)"
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="messages"
                name="messages"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMessages)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
        {activeMetric === 'SOCIAL' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-pink-500"></span>
              <span>Lượt Tương tác (Like/Comment)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-blue-600"></span>
              <span>Bài viết mới</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Số lượng tin nhắn theo ngày</span>
          </div>
        )}
      </div>
    </div>
  );
}
