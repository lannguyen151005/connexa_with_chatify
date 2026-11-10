package alan.nguyen.service.moderation;

import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.SystemRole;

import java.util.List;
import java.util.UUID;

public record PostSubmittedForModerationEvent(
        UUID postId,
        UUID authorId,
        SystemRole authorRole,
        PostPrivacy privacy,
        String content,
        List<String> hashtags,
        boolean isUpdate
) {
}

