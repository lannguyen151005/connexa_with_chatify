/**
 * Service tích hợp API thực tế cho Trợ lý Charles (Connexa AI)
 * Giao tiếp qua endpoint POST /api/v1/chatbot/ask và GET /api/v1/chatbot/status
 * Xử lý lỗi thông minh (Rate limit, Timeout, Bảo trì) và fallback an toàn khi mất kết nối mạng.
 */

import api from '@/app/utils/api';
import {
  IChatMessage,
  IChatbotAskRequest,
  IChatbotAskResponseData,
  IChatbotHistoryItem,
  IApiResponse,
} from './types';
import { mockGenerateReply } from './chatbotMockService';

const CHATBOT_API_BASE = '/api/v1/chatbot';
const MAX_HISTORY_ITEMS = 6;
const MAX_CONTENT_LENGTH = 500;

/**
 * Chuẩn hóa lịch sử hội thoại gần nhất để gửi kèm request
 */
function prepareHistoryPayload(messages: IChatMessage[]): IChatbotHistoryItem[] {
  if (!messages || messages.length === 0) return [];

  return messages
    .filter((msg) => msg.status !== 'error' && msg.content?.trim())
    .slice(-MAX_HISTORY_ITEMS)
    .map((msg) => ({
      sender: msg.sender,
      content:
        msg.content.length > MAX_CONTENT_LENGTH
          ? msg.content.substring(0, MAX_CONTENT_LENGTH)
          : msg.content,
    }));
}

/**
 * Gửi câu hỏi đến Trợ lý Charles qua Backend Quarkus
 * @param message Nội dung câu hỏi hiện tại
 * @param history Lịch sử các tin nhắn gần nhất
 * @returns Nội dung câu trả lời dạng Markdown
 */
export async function askChatbot(
  message: string,
  history: IChatMessage[] = []
): Promise<string> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return 'Xin lỗi, câu hỏi của bạn đang để trống. Hãy nhập điều bạn muốn hỏi nhé!';
  }

  const payload: IChatbotAskRequest = {
    message:
      trimmedMessage.length > MAX_CONTENT_LENGTH
        ? trimmedMessage.substring(0, MAX_CONTENT_LENGTH)
        : trimmedMessage,
    history: prepareHistoryPayload(history),
  };

  try {
    const response = await api.post<IApiResponse<IChatbotAskResponseData>>(
      `${CHATBOT_API_BASE}/ask`,
      payload
    );

    if (response.data && response.data.success && response.data.data?.reply) {
      return response.data.data.reply;
    }

    if (response.data && !response.data.success && response.data.message) {
      return response.data.message;
    }

    return 'Trợ lý Charles đã tiếp nhận nhưng chưa có câu trả lời phù hợp. Vui lòng thử lại!';
  } catch (error: any) {
    console.warn('[ChatbotService] API call failed, handling error/fallback:', error);

    // 1. Lỗi HTTP status từ Backend
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as IApiResponse<null> | undefined;
      const customMessage = errorData?.message;

      // 503 Service Unavailable (Admin tắt bot hoặc Groq AI tạm ngừng)
      if (status === 503) {
        return (
          customMessage ||
          '⚠️ **Trợ lý Charles hiện đang tạm tắt để bảo trì hệ thống.**\n\nBạn vui lòng quay lại sau ít phút hoặc tiếp tục trải nghiệm các tính năng khác của Connexa nhé!'
        );
      }

      // 429 Too Many Requests (Rate limit)
      if (status === 429) {
        return (
          customMessage ||
          '⏳ **Bạn đang gửi câu hỏi quá nhanh.**\n\nĐể đảm bảo chất lượng phục vụ cho tất cả thành viên, vui lòng đợi 1 phút trước khi tiếp tục đặt câu hỏi nhé!'
        );
      }

      // 504 Gateway Timeout
      if (status === 504) {
        return (
          customMessage ||
          '⌛ **Yêu cầu phản hồi quá thời gian chờ (Timeout).**\n\nMạng hoặc hệ thống AI đang phản hồi chậm. Bạn vui lòng thử lại sau ít giây nhé!'
        );
      }

      // 400 Bad Request
      if (status === 400) {
        return (
          customMessage ||
          'Câu hỏi của bạn chưa hợp lệ hoặc vượt quá độ dài quy định (tối đa 500 ký tự).'
        );
      }

      if (customMessage) {
        return customMessage;
      }
    }

    // 2. Lỗi mạng (ERR_CONNECTION_REFUSED / Backend offline)
    // Kích hoạt Fallback thông minh để không làm gián đoạn trải nghiệm người dùng
    try {
      console.log('[ChatbotService] Activating local fallback response...');
      const fallbackReply = await mockGenerateReply(trimmedMessage, 600);
      return `${fallbackReply}\n\n*(Lưu ý: Phản hồi tự động tạm thời do chưa kết nối được máy chủ AI)*`;
    } catch {
      return '⚠️ Hiện không thể kết nối tới máy chủ Connexa. Vui lòng kiểm tra lại kết nối mạng của bạn!';
    }
  }
}

/**
 * Kiểm tra trạng thái hoạt động của Trợ lý Charles từ Backend
 */
export async function getChatbotStatus(): Promise<{ active: boolean; botName: string }> {
  try {
    const response = await api.get<IApiResponse<{ active: boolean; botName: string }>>(
      `${CHATBOT_API_BASE}/status`
    );
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return { active: true, botName: 'Charles AI' };
  } catch {
    return { active: true, botName: 'Charles AI' };
  }
}
