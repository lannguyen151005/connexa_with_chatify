package alan.nguyen.dto.admin;

import alan.nguyen.common.ReportActionTaken;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveReportRequestDTO {

    @NotNull(message = "Biện pháp xử lý không được để trống")
    private ReportActionTaken actionTaken;

    private String resolutionNotes;
}
