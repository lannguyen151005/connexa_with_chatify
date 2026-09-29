package alan.nguyen.service.impl;

import alan.nguyen.common.PostMediaType;
import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.post.CreatePostRequestDTO;
import alan.nguyen.dto.post.PostMediaDTO;
import alan.nguyen.dto.post.PostResponseDTO;
import alan.nguyen.dto.post.UpdatePostRequestDTO;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.PostMedia;
import alan.nguyen.entity.User;
import alan.nguyen.repository.PostRepo;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.PostService;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PostServiceImpl implements PostService {

    @Inject
    PostRepo postRepo;

    @Inject
    UserRepo userRepo;

    @Override
    @Transactional
    public PostResponseDTO createPost(UUID currentUserId, CreatePostRequestDTO dto) {
        User author = userRepo.findByIdOptional(currentUserId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng"));

        Post post = Post.builder()
                .author(author)
                .content(dto.getContent().trim())
                .privacy(dto.getPrivacy() != null ? dto.getPrivacy() : PostPrivacy.PUBLIC)
                .like_count(0)
                .comment_count(0)
                .is_edited(false)
                .is_deleted(false)
                .build();

        // Xử lý danh sách media nếu có
        if (dto.getMedia_list() != null && !dto.getMedia_list().isEmpty()) {
            for (int i = 0; i < dto.getMedia_list().size(); i++) {
                PostMediaDTO mediaDTO = dto.getMedia_list().get(i);
                PostMedia media = PostMedia.builder()
                        .media_url(mediaDTO.getMedia_url().trim())
                        .media_type(mediaDTO.getMedia_type() != null ? mediaDTO.getMedia_type() : PostMediaType.IMAGE)
                        .display_order(mediaDTO.getDisplay_order() > 0 ? mediaDTO.getDisplay_order() : i)
                        .build();
                post.addMedia(media);
            }
        }

        postRepo.persist(post);
        return PostResponseDTO.fromEntity(post);
    }

    @Override
    public PostResponseDTO getPostDetail(UUID currentUserId, UUID postId) {
        Post post = postRepo.findActiveByIdWithDetails(postId)
                .orElseThrow(() -> new NotFoundException("Bài viết không tồn tại hoặc đã bị xóa"));

        // Kiểm tra quyền xem bài viết riêng tư
        if (post.getPrivacy() == PostPrivacy.PRIVATE && !post.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("Bạn không có quyền xem bài viết riêng tư này");
        }

        return PostResponseDTO.fromEntity(post);
    }

    @Override
    public PageResponseDTO<PostResponseDTO> getNewsfeed(UUID currentUserId, int page, int size) {
        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 50);

        Page pageable = Page.of(pageIndex, pageSize);
        PanacheQuery<Post> query = postRepo.findFeed(currentUserId, pageable);

        List<PostResponseDTO> items = query.list().stream()
                .map(PostResponseDTO::fromEntity)
                .toList();

        return PageResponseDTO.of(items, query.page().index, query.page().size, query.count(), query.pageCount());
    }

    @Override
    public PageResponseDTO<PostResponseDTO> getUserTimeline(UUID currentUserId, UUID targetUserId, int page, int size) {
        // Kiểm tra người dùng có tồn tại không
        if (userRepo.findByIdOptional(targetUserId).isEmpty()) {
            throw new NotFoundException("Không tìm thấy người dùng này");
        }

        boolean isOwner = currentUserId.equals(targetUserId);
        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 50);

        Page pageable = Page.of(pageIndex, pageSize);
        PanacheQuery<Post> query = postRepo.findUserTimeline(targetUserId, isOwner, pageable);

        List<PostResponseDTO> items = query.list().stream()
                .map(PostResponseDTO::fromEntity)
                .toList();

        return PageResponseDTO.of(items, query.page().index, query.page().size, query.count(), query.pageCount());
    }

    @Override
    @Transactional
    public PostResponseDTO updatePost(UUID currentUserId, UUID postId, UpdatePostRequestDTO dto) {
        Post post = postRepo.findActiveByIdWithDetails(postId)
                .orElseThrow(() -> new NotFoundException("Bài viết không tồn tại hoặc đã bị xóa"));

        // Strict Ownership Check: Chỉ chính tác giả mới được sửa
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa bài viết của người khác");
        }

        post.setContent(dto.getContent().trim());
        if (dto.getPrivacy() != null) {
            post.setPrivacy(dto.getPrivacy());
        }
        post.set_edited(true);

        return PostResponseDTO.fromEntity(post);
    }

    @Override
    @Transactional
    public void deletePost(UUID currentUserId, UUID postId) {
        Post post = postRepo.findActiveById(postId)
                .orElseThrow(() -> new NotFoundException("Bài viết không tồn tại hoặc đã bị xóa"));

        User currentUser = userRepo.findByIdOptional(currentUserId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng thực hiện thao tác"));

        boolean isAuthor = post.getAuthor().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == SystemRole.ADMIN;

        // Chỉ tác giả hoặc ADMIN mới được xóa
        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền xóa bài viết này");
        }

        // Xóa mềm: Bật cờ is_deleted = true
        post.set_deleted(true);
    }
}
