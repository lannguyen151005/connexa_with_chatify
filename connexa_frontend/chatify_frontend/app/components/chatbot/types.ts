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
    id: 'qp_coffee',
    icon: 'fa-classic fa-solid fa-mug-saucer',
    label: 'Caption cafe cuối tuần',
    promptText: 'Gợi ý cho mình 3 caption thú vị cho bài viết đi cafe thư giãn cuối tuần nhé.',
    category: 'caption',
  },
  {
    id: 'qp_travel',
    icon: 'fa-classic fa-solid fa-plane-departure',
    label: 'Caption du lịch sống ảo',
    promptText: 'Gợi ý giúp mình caption hay và sâu lắng để đăng ảnh đi du lịch biển.',
    category: 'caption',
  },
  {
    id: 'qp_hashtag',
    icon: 'fa-classic fa-solid fa-hashtag',
    label: 'Hashtag xu hướng',
    promptText: 'Tạo giúp mình bộ hashtag thịnh hành cho bài viết về công nghệ và đời sống.',
    category: 'hashtag',
  },
  {
    id: 'qp_community_rules',
    icon: 'fa-classic fa-solid fa-shield-halved',
    label: 'Tiêu chuẩn cộng đồng',
    promptText: 'Tiêu chuẩn cộng đồng khi đăng bài viết trên mạng xã hội Connexa gồm những gì?',
    category: 'rule',
  },
];
