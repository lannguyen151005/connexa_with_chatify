package alan.nguyen.dto;

import lombok.Data;

import java.sql.Date;
import java.util.List;
import java.util.UUID;

public class CreateGroupRequestDTO {
    public UUID creatorId;
    public String title;
    public List<UUID> memberIds;
    public String avatar_url;
}
