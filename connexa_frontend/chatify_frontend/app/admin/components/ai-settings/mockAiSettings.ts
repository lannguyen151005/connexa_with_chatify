import { BadWordItem, BadWordSettings, CharlesAiConfig, SystemAnnouncement } from './types';

export const INITIAL_AI_CONFIG: CharlesAiConfig = {
  isBotEnabled: true,
  modelName: "Quarkus LangChain4j (Demo / Chưa kết nối thật)",
  systemPrompt: "Bạn là Charles AI, trợ lý học tập và thông tin sinh viên thuộc mạng xã hội Connexa. Hãy luôn trả lời bằng giọng điệu thân thiện, súc tích, văn minh và bằng tiếng Việt chuẩn mực.",
  temperature: 0.7,
  maxTokens: 1500,
  tokensUsedToday: 18450,
  dailyTokenLimit: 50000,
  latencyMs: 320,
  isLiveConnected: false,
  updatedAt: "2026-10-18T14:00:00Z",
};

export const INITIAL_BAD_WORD_SETTINGS: BadWordSettings = {
  action: 'FLAG_FOR_REVIEW',
  scope: ['POST', 'COMMENT'],
  words: [
    { id: 'bw-1', keyword: 'lừa đảo', severity: 'HIGH', category: 'Gian lận', createdAt: '2026-09-01T08:00:00Z' },
    { id: 'bw-2', keyword: 'cờ bạc', severity: 'HIGH', category: 'Tệ nạn', createdAt: '2026-09-01T08:00:00Z' },
    { id: 'bw-3', keyword: 'vay tiền nóng', severity: 'HIGH', category: 'Tài chính đen', createdAt: '2026-09-02T10:00:00Z' },
    { id: 'bw-4', keyword: 'mua bán bằng cấp', severity: 'HIGH', category: 'Gian lận học vụ', createdAt: '2026-09-05T11:00:00Z' },
    { id: 'bw-5', keyword: 'đồ ngu', severity: 'MEDIUM', category: 'Xúc phạm', createdAt: '2026-09-10T09:00:00Z' },
    { id: 'bw-6', keyword: 'chửi bậy', severity: 'MEDIUM', category: 'Thiếu văn minh', createdAt: '2026-09-12T14:30:00Z' },
    { id: 'bw-7', keyword: 'hack pass', severity: 'HIGH', category: 'An ninh mạng', createdAt: '2026-09-15T16:00:00Z' },
    { id: 'bw-8', keyword: 'việc nhẹ lương cao', severity: 'MEDIUM', category: 'Dụ dỗ lừa đảo', createdAt: '2026-09-20T10:20:00Z' },
  ],
};

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: "ann-001",
    title: "Bảo trì nâng cấp hạ tầng WebSocket Chatify",
    content: "Hệ thống sẽ thực hiện bảo trì định kỳ máy chủ tin nhắn thời gian thực từ 00:00 đến 00:30 ngày 20/10/2026. Trong thời gian này tính năng chat có thể bị gián đoạn ngắn.",
    severity: "WARNING",
    status: "ACTIVE",
    targetAudience: "ALL",
    expiresAt: "2026-10-21T00:00:00Z",
    createdAt: "2026-10-17T08:00:00Z",
    updatedAt: "2026-10-17T08:00:00Z",
  },
  {
    id: "ann-002",
    title: "Chào đón Tân sinh viên K64 gia nhập Connexa",
    content: "Chúc toàn thể tân sinh viên một năm học mới đầy hứng khởi, học tập hiệu quả và kết nối nhiều bạn bè mới qua nền tảng mạng xã hội trường Connexa!",
    severity: "INFO",
    status: "DRAFT",
    targetAudience: "STUDENTS",
    expiresAt: "2026-11-01T00:00:00Z",
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },
];

let aiConfigState: CharlesAiConfig = { ...INITIAL_AI_CONFIG };
let badWordsState: BadWordSettings = {
  ...INITIAL_BAD_WORD_SETTINGS,
  words: [...INITIAL_BAD_WORD_SETTINGS.words],
};
let announcementsState: SystemAnnouncement[] = [...INITIAL_ANNOUNCEMENTS];

// State Accessors & Mutators
export const getMockAiConfig = (): CharlesAiConfig => ({ ...aiConfigState });

export const updateMockAiConfig = (updates: Partial<CharlesAiConfig>): CharlesAiConfig => {
  aiConfigState = {
    ...aiConfigState,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return { ...aiConfigState };
};

export const getMockBadWords = (): BadWordSettings => ({
  ...badWordsState,
  words: [...badWordsState.words],
});

export const addMockBadWord = (item: Omit<BadWordItem, 'id' | 'createdAt'>): BadWordItem => {
  const newItem: BadWordItem = {
    id: `bw-${Date.now()}`,
    ...item,
    createdAt: new Date().toISOString(),
  };
  badWordsState.words = [newItem, ...badWordsState.words];
  return newItem;
};

export const removeMockBadWord = (id: string): boolean => {
  badWordsState.words = badWordsState.words.filter((w) => w.id !== id);
  return true;
};

export const updateMockBadWordAction = (action: BadWordSettings['action']): boolean => {
  badWordsState.action = action;
  return true;
};

export const getMockAnnouncements = (): SystemAnnouncement[] => [...announcementsState];

export const saveMockAnnouncement = (ann: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SystemAnnouncement => {
  if (ann.id) {
    const idx = announcementsState.findIndex((a) => a.id === ann.id);
    if (idx !== -1) {
      const updated: SystemAnnouncement = {
        ...announcementsState[idx],
        ...ann,
        updatedAt: new Date().toISOString(),
      };
      announcementsState[idx] = updated;
      return updated;
    }
  }

  const created: SystemAnnouncement = {
    id: `ann-${Date.now()}`,
    title: ann.title,
    content: ann.content,
    severity: ann.severity,
    status: ann.status,
    targetAudience: ann.targetAudience,
    expiresAt: ann.expiresAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  announcementsState = [created, ...announcementsState];
  return created;
};

export const deleteMockAnnouncement = (id: string): boolean => {
  announcementsState = announcementsState.filter((a) => a.id !== id);
  return true;
};
