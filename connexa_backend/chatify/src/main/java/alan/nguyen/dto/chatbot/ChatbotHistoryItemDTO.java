package alan.nguyen.dto.chatbot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Mục tin nhắn trong lịch sử trò chuyện gần nhất gửi kèm từ Client
 */
public record ChatbotHistoryItemDTO(
    @NotBlank(message = "Người gửi sender không được để trống")
    String sender, // "user" hoặc "bot"

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 500, message = "Nội dung tin nhắn lịch sử tối đa 500 ký tự")
    String content
) {}