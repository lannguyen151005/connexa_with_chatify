export interface CharlesAiConfig {
  isBotEnabled: boolean;
  modelName: string;
  systemPrompt: string;
  temperature: number; // 0.0 - 1.0
  maxTokens: number;   // 500 - 4000
  tokensUsedToday: number;
  dailyTokenLimit: number;
  latencyMs: number;
  isLiveConnected: boolean;
  updatedAt: string;
}

export type BadWordSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type BadWordAction = 'FLAG_FOR_REVIEW' | 'AUTO_HIDE';

export interface BadWordItem {
  id: string;
  keyword: string;
  severity: BadWordSeverity;
  category: string;
  createdAt: string;
}

export interface BadWordSettings {
  words: BadWordItem[];
  action: BadWordAction;
  scope: ('POST' | 'COMMENT')[];
}

export type AnnouncementSeverity = 'INFO' | 'WARNING' | 'URGENT';
export type AnnouncementStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  severity: AnnouncementSeverity;
  status: AnnouncementStatus;
  targetAudience: 'ALL' | 'STUDENTS' | 'ADMINS';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AiSettingsSubTab = 'AI_BOT' | 'BAD_WORDS' | 'ANNOUNCEMENTS';
