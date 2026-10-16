package alan.nguyen.dto.connexa.user;

import alan.nguyen.common.FriendRequestStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileDetailDTO {
    public String username;
    public String avatarUrl;
    public LocalDate birthday;
    public String note;
    public FriendRequestStatus requestStatus;
}
