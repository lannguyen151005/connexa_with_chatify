package alan.nguyen.dto.interaction;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateCommentRequestDTO {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;

    private UUID parentId;
}