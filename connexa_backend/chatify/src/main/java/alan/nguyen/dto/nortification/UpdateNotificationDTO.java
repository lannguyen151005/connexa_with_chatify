package alan.nguyen.dto.nortification;

import alan.nguyen.common.NortificationType;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateNotificationDTO {
    public UUID nortificationId;
    public NortificationType type;
}
