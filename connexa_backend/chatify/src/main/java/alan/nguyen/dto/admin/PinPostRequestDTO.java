package alan.nguyen.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PinPostRequestDTO {
    @NotNull(message = "Trạng thái ghim isPinned không được để trống")
    private Boolean isPinned;
}
