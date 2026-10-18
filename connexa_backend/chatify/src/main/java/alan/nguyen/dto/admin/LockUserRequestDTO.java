package alan.nguyen.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LockUserRequestDTO {

    @NotBlank(message = "Loại khóa không được để trống (TEMPORARY hoặc PERMANENT)")
    private String type;

    private Integer durationDays;

    private String reason;
}
