package alan.nguyen.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FriendRequestRequestDTO {
    private UUID receiverId;
}