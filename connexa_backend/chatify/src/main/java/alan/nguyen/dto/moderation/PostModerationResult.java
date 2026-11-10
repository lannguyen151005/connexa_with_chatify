package alan.nguyen.dto.moderation;

public record PostModerationResult(
        boolean flagged,
        String category,
        double confidence,
        String reason
) {
    public static PostModerationResult clean() {
        return new PostModerationResult(false, "NONE", 0.0, "");
    }
}

