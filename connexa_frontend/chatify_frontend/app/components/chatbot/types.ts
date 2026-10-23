/**
 * Types và Interfaces cho Connexa AI Chatbot (Trợ lý Charles)
 * Tuân thủ quy chuẩn TypeScript trong AGENTS.md & FRONTEND_ARCHITECTURE.md
 */

export type MessageSender = 'user' | 'bot';

export type MessageStatus = 'sending' | 'success' | 'error';

export interface IChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: number;
  status?: MessageStatus;
}

export interface IQuickPrompt {
  id: string;
  icon: string;
  label: string;
  promptText: string;
  category?: 'caption' | 'hashtag' | 'rule' | 'help';
}

export interface IChatbotState {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  messages: IChatMessage[];
}

export interface IChatbotHistoryItem {
  sender: 'user' | 'bot';
  content: string;
}

export interface IChatbotAskRequest {
  message: string;
  history?: IChatbotHistoryItem[];
}

export interface IChatbotAskResponseData {
  reply: string;
  botName: string;
  timestamp: number;
  tokensUsed?: number;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Metadata cố định của Trợ lý Charles (đồng bộ theo hệ thống Connexa/Chatify)
 */
export const BOT_METADATA = {
  id: '2d61b0d1-1512-494b-ba1d-bf1c55de1173',
  senderId: 'bot_charles',
  name: 'Trợ lý Charles',
  roleTitle: 'Connexa AI Assistant',
  avatarUrl: 'https://res.cloudinary.com/dccrvc4ok/image/upload/v1779908725/m7kwsxat7fvqithiqogt.png',
  defaultGreeting: 'Xin chào! Tôi là **Trợ lý Charles** 🤖 từ mạng xã hội Connexa.\n\nTôi có thể giúp bạn:\n- ✨ **Viết caption** hay theo từng cảm xúc\n- 🏷️ **Gợi ý hashtag** thịnh hành cho bài viết\n- 🛡️ Tìm hiểu **tiêu chuẩn cộng đồng**\n- ❓ Hướng dẫn sử dụng tính năng Connexa\n\nHãy chọn gợi ý nhanh bên dưới hoặc nhắn câu hỏi cho tôi nhé!',
} as const;

/**
 * Danh sách gợi ý câu hỏi 1-chạm mặc định cho Trợ lý mạng xã hội
 */
export const DEFAULT_QUICK_PROMPTS: IQuickPrompt[] = [
  {
    id: 'qp_feed',
    icon: 'fa-classic fa-solid fa-newspaper',
    label: 'Cách đăng bài & ảnh',
    promptText: 'Hướng dẫn mình cách tạo bài viết kèm ảnh và các chế độ quyền riêng tư trên Connexa.',
    category: 'help',
  },
  {
    id: 'qp_hashtag',
    icon: 'fa-classic fa-solid fa-hashtag',
    label: 'Hashtag xu hướng',
    promptText: 'Connexa hỗ trợ tìm kiếm bài viết theo hashtag và hashtag xu hướng như thế nào?',
    category: 'hashtag',
  },
  {
    id: 'qp_chatify',
    icon: 'fa-classic fa-solid fa-comments',
    label: 'Tính năng chat Chatify',
    promptText: 'Tính năng nhắn tin Chatify có những điểm nổi bật gì?',
    category: 'help',
  },
  {
    id: 'qp_community_rules',
    icon: 'fa-classic fa-solid fa-shield-halved',
    label: 'Tiêu chuẩn cộng đồng',
    promptText: 'Tiêu chuẩn cộng đồng khi đăng bài viết trên mạng xã hội Connexa gồm những gì?',
    category: 'rule',
  },
];
