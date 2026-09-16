"use client";

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardView() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRooms: 0, totalMessagesToday: 0 });
  const [chartData, setChartData] = useState([]);
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [botTokens, setBotTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      setStats({ totalUsers: res.data.totalUsers, totalRooms: res.data.totalRooms, totalMessagesToday: res.data.totalMessagesToday });
      setChartData(res.data.chartData);
      setIsBotEnabled(res.data.isBotEnabled);
      setBotTokens(res.data.botTokensUsed);
    } catch (error) {
      toast.error("Lỗi đồng bộ dữ liệu Dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBot = async () => {
    try {
      const newState = !isBotEnabled;
      await api.post('/api/admin/bot/toggle', { enabled: newState });
      setIsBotEnabled(newState);
      toast.success(newState ? "Đã BẬT Charles AI" : "Đã TẮT Charles AI");
    } catch (error) {
      toast.error("Lỗi khi đổi trạng thái Bot!");
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="fade-in">
      <h3 className="fw-bold text-dark mb-4">Tổng quan Hệ thống</h3>
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100 border-start border-primary border-4">
            <h6 className="text-muted fw-bold mb-2">TỔNG THÀNH VIÊN</h6>
            <h2 className="fw-bold text-dark">{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100 border-start border-success border-4">
            <h6 className="text-muted fw-bold mb-2">TỔNG PHÒNG CHAT</h6>
            <h2 className="fw-bold text-dark">{stats.totalRooms}</h2>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100 border-start border-info border-4">
            <h6 className="text-muted fw-bold mb-2">TIN NHẮN HÔM NAY</h6>
            <h2 className="fw-bold text-dark">{stats.totalMessagesToday}</h2>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className={`card border-0 shadow-sm p-4 rounded-4 h-100 border-start border-4 ${isBotEnabled ? 'border-warning' : 'border-secondary bg-light'}`}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="text-muted fw-bold mb-2">TRỢ LÝ CHARLES</h6>
                <div className="form-check form-switch fs-5">
                  <input className="form-check-input" type="checkbox" role="switch" checked={isBotEnabled} onChange={handleToggleBot} style={{ cursor: 'pointer' }} />
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Token sử dụng</small>
                <span className="badge bg-dark fs-6">{botTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold text-dark mb-4"><i className="fas fa-chart-area me-2 text-primary"></i>Lưu lượng tin nhắn (7 ngày qua)</h5>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{fill: '#6c757d'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#6c757d'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="messages" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4, fill: '#0d6efd', strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}