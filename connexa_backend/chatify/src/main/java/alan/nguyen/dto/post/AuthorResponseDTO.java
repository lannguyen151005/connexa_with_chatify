package alan.nguyen.dto.post;

import alan.nguyen.entity.User;

import java.util.UUID;

/**
 * DTO chứa thông tin rút gọn của tác giả bài viết
 */
public record AuthorResponseDTO(
        UUID id,
        String username,
        String avatar_url
) {
    public static AuthorResponseDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new AuthorResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getAvatar_url()
        );
    }
}
