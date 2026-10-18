package alan.nguyen.service;

import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.connexa.post.CreatePostRequestDTO;
import alan.nguyen.dto.connexa.post.PostResponseDTO;
import alan.nguyen.dto.connexa.post.UpdatePostRequestDTO;

import java.util.UUID;

public interface PostService {

    /**
     * Tạo bài viết mới kèm tệp đa phương tiện
     */
    PostResponseDTO createPost(UUID currentUserId, CreatePostRequestDTO dto);

    /**
     * Xem chi tiết một bài viết
     */
    PostResponseDTO getPostDetail(UUID currentUserId, UUID postId);

    /**
     * Lấy bảng tin (Newsfeed) có phân trang
     */
    PageResponseDTO<PostResponseDTO> getNewsfeed(UUID currentUserId, int page, int size);

    /**
     * Lấy danh sách bài viết trên trang cá nhân (Timeline) có phân trang
     */
    PageResponseDTO<PostResponseDTO> getUserTimeline(UUID currentUserId, UUID targetUserId, int page, int size);

    /**
     * Cập nhật nội dung hoặc quyền riêng tư của bài viết (Chỉ tác giả)
     */
    PostResponseDTO updatePost(UUID currentUserId, UUID postId, UpdatePostRequestDTO dto);

    /**
     * Xóa mềm bài viết (Chỉ tác giả hoặc ADMIN)
     */
    void deletePost(UUID currentUserId, UUID postId);

    /**
     * Ghim hoặc bỏ ghim bài viết (Dành cho Admin)
     */
    PostResponseDTO setPinPost(UUID postId, boolean isPinned);

    /**
     * Lấy danh sách bài viết dành cho Admin quản lý/kiểm duyệt
     */
    PageResponseDTO<PostResponseDTO> getAdminPosts(int page, int size);
}

