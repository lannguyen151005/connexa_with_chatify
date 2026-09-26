package alan.nguyen.service;

import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.interaction.CommentResponseDTO;
import alan.nguyen.dto.interaction.CreateCommentRequestDTO;
import alan.nguyen.dto.interaction.ReactionRequestDTO;

import java.util.UUID;

public interface PostInteractionService {

    /** Thả, thay đổi hoặc gỡ cảm xúc bài viết */
    void toggleReaction(UUID currentUserId, UUID postId, ReactionRequestDTO dto);

    /** Tạo mới một bình luận */
    CommentResponseDTO createComment(UUID currentUserId, UUID postId, CreateCommentRequestDTO dto);

    /** Lấy danh sách bình luận có phân trang */
    PageResponseDTO<CommentResponseDTO> getPostComments(UUID postId, int page, int size);

    /** Xóa mềm bình luận (Tác giả bình luận hoặc tác giả bài viết có quyền xóa) */
    void deleteComment(UUID currentUserId, UUID commentId);
}