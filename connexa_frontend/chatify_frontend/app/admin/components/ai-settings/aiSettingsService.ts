import api from '../../../utils/api';
import {
  BadWordItem,
  BadWordSettings,
  CharlesAiConfig,
  SystemAnnouncement,
} from './types';
import {
  addMockBadWord,
  deleteMockAnnouncement,
  getMockAiConfig,
  getMockAnnouncements,
  getMockBadWords,
  removeMockBadWord,
  saveMockAnnouncement,
  updateMockAiConfig,
  updateMockBadWordAction,
} from './mockAiSettings';

export const isAiSettingsMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ADMIN_AI_SETTINGS_MOCK === 'true';
};

// ==========================================
// 1. CHARLES AI API & SERVICE
// ==========================================

export const fetchAiConfig = async (): Promise<CharlesAiConfig> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockAiConfig();
  }

  // Live Backend: Gọi Quarkus Backend
  const res = await api.get('/api/admin/ai/config');
  return res.data;
};

export const toggleBotStateApi = async (newState: boolean): Promise<boolean> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    updateMockAiConfig({ isBotEnabled: newState });
    return newState;
  }

  // Tái sử dụng chính xác endpoint /api/admin/bot/toggle đã đồng bộ ở Dashboard
  await api.post('/api/admin/bot/toggle', { enabled: newState });
  return newState;
};

export const saveAiConfigApi = async (updates: Partial<CharlesAiConfig>): Promise<CharlesAiConfig> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return updateMockAiConfig(updates);
  }

  const res = await api.put('/api/admin/ai/config', updates);
  return res.data;
};

// ==========================================
// 2. BAD WORDS BLACKLIST SERVICE
// ==========================================

export const fetchBadWords = async (): Promise<BadWordSettings> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockBadWords();
  }

  const res = await api.get('/api/admin/system/bad-words');
  return res.data;
};

export const addBadWordApi = async (item: Omit<BadWordItem, 'id' | 'createdAt'>): Promise<BadWordItem> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return addMockBadWord(item);
  }

  const res = await api.post('/api/admin/system/bad-words', item);
  return res.data;
};

export const removeBadWordApi = async (id: string): Promise<boolean> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return removeMockBadWord(id);
  }

  await api.delete(`/api/admin/system/bad-words/${id}`);
  return true;
};

export const updateBadWordActionApi = async (action: BadWordSettings['action']): Promise<boolean> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return updateMockBadWordAction(action);
  }

  await api.patch('/api/admin/system/bad-words/action', { action });
  return true;
};

// ==========================================
// 3. SYSTEM ANNOUNCEMENTS SERVICE
// ==========================================

export const fetchAnnouncements = async (): Promise<SystemAnnouncement[]> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockAnnouncements();
  }

  const res = await api.get('/api/admin/system/announcements');
  return res.data;
};

export const saveAnnouncementApi = async (
  announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<SystemAnnouncement> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return saveMockAnnouncement(announcement);
  }

  if (announcement.id) {
    const res = await api.put(`/api/admin/system/announcements/${announcement.id}`, announcement);
    return res.data;
  }
  const res = await api.post('/api/admin/system/announcements', announcement);
  return res.data;
};

export const deleteAnnouncementApi = async (id: string): Promise<boolean> => {
  if (isAiSettingsMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return deleteMockAnnouncement(id);
  }

  await api.delete(`/api/admin/system/announcements/${id}`);
  return true;
};
