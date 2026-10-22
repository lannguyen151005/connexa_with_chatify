package alan.nguyen.dto.chatbot;

/**
 * DTO dữ liệu phản hồi từ Trợ lý Charles trả về cho Client
 */
public record ChatbotAskResponseDTO(
    String reply,
    String botName,
    long timestamp,
    Long tokensUsed
) {}