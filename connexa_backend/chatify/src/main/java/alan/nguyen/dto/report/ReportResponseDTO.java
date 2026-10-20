package alan.nguyen.dto.report;

import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.entity.Report;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDTO {

    private UUID id;
    private ReportTargetType targetType;
    private UUID targetId;
    private String reason;
    private String details;
    private ReportStatus status;
    private LocalDateTime createdAt;

    public static ReportResponseDTO fromEntity(Report report) {
        if (report == null) return null;
        return ReportResponseDTO.builder()
                .id(report.getId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .details(report.getDetails())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
