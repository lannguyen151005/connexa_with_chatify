package alan.nguyen.dto;

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
}