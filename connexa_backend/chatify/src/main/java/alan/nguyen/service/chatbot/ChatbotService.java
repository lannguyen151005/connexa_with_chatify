package alan.nguyen.service.chatbot;

import alan.nguyen.dto.chatbot.ChatbotAskRequestDTO;
import alan.nguyen.dto.chatbot.ChatbotAskResponseDTO;
import alan.nguyen.dto.chatbot.ChatbotHistoryItemDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class ChatbotService {

    private static final Logger LOG = Logger.getLogger(ChatbotService.class);

    @Inject
    AIService aiService;

    @Inject
    ChatbotConfigService chatbotConfigService;

    @ActivateRequestContext
    public String ask(String prompt) {
        return aiService.chat(prompt);
    }

    @ActivateRequestContext
    public String summerize(String prompt) {
        return aiService.summarize(prompt);
    }

    /**
     * Xử lý câu hỏi về hệ thống Connexa & Chatify kèm ngữ cảnh hội thoại
     *
     * @param request DTO chứa câu hỏi và lịch sử chat gần nhất
     * @param userDisplayName Tên hiển thị của user (hoặc null nếu là khách vãng lai)
     * @return ChatbotAskResponseDTO kết quả trả lời kèm metadata
     */
    @ActivateRequestContext
    public ChatbotAskResponseDTO askAboutConnexa(ChatbotAskRequestDTO request, String userDisplayName) {
        String prompt = buildPromptWithContext(request, userDisplayName);
        LOG.infof("Chatbot Charles received question from user [%s]. Prompt length: %d",
                userDisplayName != null ? userDisplayName : "Khách", prompt.length());

        String reply = aiService.askAboutConnexa(prompt);

        // Ước tính số tokens tiêu thụ (khoảng 4 ký tự / 1 token) để cập nhật telemetry
        long estimatedPromptTokens = Math.max(1, prompt.length() / 4);
        long estimatedReplyTokens = Math.max(1, (reply != null ? reply.length() : 0) / 4);
        long totalTokens = estimatedPromptTokens + estimatedReplyTokens;

        chatbotConfigService.recordTokensUsed(totalTokens);

        return new ChatbotAskResponseDTO(
                reply,
                "Charles AI",
                System.currentTimeMillis(),
                chatbotConfigService.getTokensUsed()
        );
    }

    /**
     * Định dạng lịch sử hội thoại và thông tin người dùng thành prompt hoàn chỉnh cho AI Service
     */
    private String buildPromptWithContext(ChatbotAskRequestDTO request, String userDisplayName) {
        StringBuilder sb = new StringBuilder();

        List<ChatbotHistoryItemDTO> history = request.history();
        if (history != null && !history.isEmpty()) {
            sb.append("LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ:\n");
            for (ChatbotHistoryItemDTO item : history) {
                if (item != null && item.content() != null && !item.content().isBlank()) {
                    String senderName = "user".equalsIgnoreCase(item.sender()) ? "Người dùng" : "Charles";
                    sb.append("[").append(senderName).append("]: ").append(item.content().trim()).append("\n");
                }
            }
            sb.append("\n");
        }

        String displayName = (userDisplayName != null && !userDisplayName.isBlank()) ? userDisplayName.trim() : "Khách";
        sb.append("NGƯỜI DÙNG HIỆN TẠI: ").append(displayName).append("\n");
        sb.append("CÂU HỎI:\n").append(request.message().trim());

        return sb.toString();
    }
}
