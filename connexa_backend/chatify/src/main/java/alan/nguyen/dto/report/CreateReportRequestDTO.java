package alan.nguyen.dto.report;

import alan.nguyen.common.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReportRequestDTO {

    @NotNull(message = "Loại đối tượng báo cáo không được để trống")
    private ReportTargetType targetType;

    @NotNull(message = "ID đối tượng báo cáo không được để trống")
    private UUID targetId;

    @NotBlank(message = "Lý do báo cáo không được để trống")
    @Size(max = 255, message = "Lý do không được vượt quá 255 ký tự")
    private String reason;

    private String details;
}
