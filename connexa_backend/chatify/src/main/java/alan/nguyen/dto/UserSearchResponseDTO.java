package alan.nguyen.dto;

import alan.nguyen.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponseDTO {

    private UUID id;
    private String username;
    private String email;
    private String avatar_url;
    private String relationship;
    private long mutualFriends;

    public static UserSearchResponseDTO fromEntity(User user) {
        return new UserSearchResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatar_url(),
                null,
                0
        );
    }
}