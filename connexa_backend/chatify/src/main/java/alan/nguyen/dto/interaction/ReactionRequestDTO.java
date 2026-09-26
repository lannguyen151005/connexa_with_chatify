package alan.nguyen.dto.interaction;

import alan.nguyen.common.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReactionRequestDTO {
    @NotNull(message = "Loại biểu cảm không được để trống")
    private ReactionType type;
}