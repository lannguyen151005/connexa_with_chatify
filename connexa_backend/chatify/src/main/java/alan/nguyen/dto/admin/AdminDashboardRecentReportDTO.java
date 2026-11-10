package alan.nguyen.dto.admin;

import alan.nguyen.common.ReportSource;
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
public class AdminDashboardRecentReportDTO {

    private UUID id;
    private String reporterName;
    private String reporterAvatar;
    private ReportSource source;
    private Double aiConfidence;
    private ReportTargetType targetType;
    private String targetSummary;
    private String reason;
    private LocalDateTime createdAt;
    private ReportStatus status;
}

