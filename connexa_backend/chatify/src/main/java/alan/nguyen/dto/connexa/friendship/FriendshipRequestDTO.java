package alan.nguyen.dto.connexa.friendship;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FriendshipRequestDTO {
    private UUID receiverId;
}