package alan.nguyen.service.moderation;

import alan.nguyen.dto.moderation.PostModerationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Bao bọc lời gọi LLM kiểm duyệt bài viết và chuẩn hóa/phân tích kết quả JSON an toàn.
 */
@ApplicationScoped
public class PostModerationClassifier {

    private static final Logger LOG = Logger.getLogger(PostModerationClassifier.class);

    private static final Pattern THINK_BLOCK_PATTERN =
            Pattern.compile("<think>[\\s\\S]*?</think>", Pattern.CASE_INSENSITIVE);
    private static final Pattern MARKDOWN_FENCE_PATTERN =
            Pattern.compile("```(?:json)?", Pattern.CASE_INSENSITIVE);

    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
            "SPAM",
            "SCAM",
            "HATE_SPEECH",
            "HARASSMENT",
            "ADULT_CONTENT",
            "IMPERSONATION",
            "OTHER",
            "NONE"
    );

    @Inject
    PostModerationAiClient aiClient;

    @Inject
    ObjectMapper objectMapper;

    public PostModerationClassifier() {
    }

    public PostModerationClassifier(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public PostModerationResult classify(String content, List<String> hashtags) {
        String prompt = buildPrompt(content, hashtags);
        String rawResponse = aiClient.analyzePost(prompt);
        return parseAiResponse(rawResponse);
    }

    String buildPrompt(String content, List<String> hashtags) {
        String safeContent = sanitizeDelimiterTags(content == null ? "" : content.trim());
        String safeTags = (hashtags == null || hashtags.isEmpty())
                ? "(không có)"
                : sanitizeDelimiterTags(String.join(", ", hashtags));

        return """
Hãy phân loại bài đăng sau đây theo đúng quy tắc an toàn nội dung:
<post_content>
%s
</post_content>
<hashtags>%s</hashtags>
""".formatted(safeContent, safeTags);
    }

    private String sanitizeDelimiterTags(String input) {
        return input
                .replaceAll("(?i)</?post_content>", "[tag]")
                .replaceAll("(?i)</?hashtags>", "[tag]");
    }

    public PostModerationResult parseAiResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return PostModerationResult.clean();
        }

        // Loại bỏ block suy luận <think>...</think> (thường gặp ở Qwen3) và markdown fence
        String cleaned = THINK_BLOCK_PATTERN.matcher(rawResponse).replaceAll("");
        cleaned = MARKDOWN_FENCE_PATTERN.matcher(cleaned).replaceAll("").trim();

        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace < 0 || lastBrace <= firstBrace) {
            LOG.warnf("AI moderation did not return a JSON object. Raw length=%d", rawResponse.length());
            return PostModerationResult.clean();
        }

        String jsonPayload = cleaned.substring(firstBrace, lastBrace + 1);
        try {
            ObjectMapper mapper = objectMapper != null ? objectMapper : new ObjectMapper();
            JsonNode node = mapper.readTree(jsonPayload);
            boolean flagged = node.path("flagged").asBoolean(false);
            String rawCategory = node.path("category").asText("NONE").trim().toUpperCase(Locale.ROOT);
            double confidence = clampConfidence(node.path("confidence").asDouble(0.0));
            String reason = node.path("reason").asText("").trim();

            String category = normalizeCategory(rawCategory, flagged);
            if ("NONE".equals(category)) {
                flagged = false;
            }
            if (reason.length() > 500) {
                reason = reason.substring(0, 500);
            }
            if (flagged && reason.isBlank()) {
                reason = "AI phát hiện nội dung có dấu hiệu vi phạm nhóm " + category;
            }

            return new PostModerationResult(flagged, category, confidence, reason);
        } catch (Exception e) {
            LOG.warnf(e, "Failed to parse AI moderation JSON payload: %s", jsonPayload);
            return PostModerationResult.clean();
        }
    }

    private String normalizeCategory(String rawCategory, boolean flagged) {
        if (ALLOWED_CATEGORIES.contains(rawCategory)) {
            return rawCategory;
        }
        return flagged ? "OTHER" : "NONE";
    }

    private double clampConfidence(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return 0.0;
        }
        return Math.max(0.0, Math.min(1.0, value));
    }
}
