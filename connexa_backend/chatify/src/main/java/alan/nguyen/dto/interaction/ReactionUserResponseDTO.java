package alan.nguyen.dto.interaction;

import alan.nguyen.entity.PostReaction;
import alan.nguyen.common.ReactionType; // Hoặc Enum ReactionType tương ứng trong dự án của bạn
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionUserResponseDTO {
    private UUID authorId;
    private String authorName;
    private String authorAvatarUrl;
    private ReactionType type;
    private LocalDateTime createdAt;

    public static ReactionUserResponseDTO fromEntity(PostReaction reaction) {
        if (reaction == null || reaction.getAuthor() == null) {
            return null;
        }

        return ReactionUserResponseDTO.builder()
                .authorId(reaction.getAuthor().getId())
                .authorName(reaction.getAuthor().getUsername())
                .authorAvatarUrl(reaction.getAuthor().getAvatar_url())
                .type(reaction.getType())
                .createdAt(reaction.getCreatedAt())
                .build();
    }
}