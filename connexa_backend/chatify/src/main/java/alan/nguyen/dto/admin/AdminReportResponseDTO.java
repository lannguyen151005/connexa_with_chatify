package alan.nguyen.dto.admin;

import alan.nguyen.common.ReportActionTaken;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReportResponseDTO {

    private UUID id;
    private UserSimpleDTO reporter;
    private ReportTargetType targetType;
    private UUID targetId;
    private TargetPreviewDTO targetPreview;
    private String reason;
    private String details;
    private ReportStatus status;
    private ReportActionTaken actionTaken;
    private String resolutionNotes;
    private UserSimpleDTO resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSimpleDTO {
        private UUID id;
        private String username;
        private String avatarUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TargetPreviewDTO {
        private String content;
        private UserSimpleDTO author;
    }
}
