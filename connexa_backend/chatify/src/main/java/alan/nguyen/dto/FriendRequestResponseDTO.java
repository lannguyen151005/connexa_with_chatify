package alan.nguyen.dto;

import alan.nguyen.common.FriendRequestStatus;
import alan.nguyen.entity.FriendRequest;
import alan.nguyen.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponseDTO {

    private UUID id;
    private UserSummaryDTO sender;
    private UserSummaryDTO receiver;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FriendRequestResponseDTO from(FriendRequest request) {
        return new FriendRequestResponseDTO(
                request.getId(),
                UserSummaryDTO.from(request.getSender()),
                UserSummaryDTO.from(request.getReceiver()),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDTO {
        private UUID id;
        private String username;
        private String email;
        private String avatar_url;

        private static UserSummaryDTO from(User user) {
            return new UserSummaryDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getAvatar_url()
            );
        }
    }
}
