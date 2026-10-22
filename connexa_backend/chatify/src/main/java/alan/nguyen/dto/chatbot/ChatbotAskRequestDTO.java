package alan.nguyen.dto.chatbot;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Payload yêu cầu gửi câu hỏi đến Trợ lý Charles từ Client
 */
public record ChatbotAskRequestDTO(
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 500, message = "Câu hỏi tối đa 500 ký tự")
    String message,

    @Size(max = 6, message = "Lịch sử hội thoại tối đa 6 tin nhắn gần nhất")
    List<@Valid ChatbotHistoryItemDTO> history
) {}