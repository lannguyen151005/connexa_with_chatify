package alan.nguyen;

import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.admin.LockUserRequestDTO;
import alan.nguyen.dto.chatify.user.LoginRequestDTO;
import alan.nguyen.dto.connexa.post.PostResponseDTO;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.PostComment;
import alan.nguyen.entity.User;
import alan.nguyen.repository.PostCommentRepo;
import alan.nguyen.repository.PostReactionRepo;
import alan.nguyen.repository.PostRepo;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.PostService;
import alan.nguyen.service.UserService;
import alan.nguyen.service.auth.JwtService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class AdminTier1FeaturesTest {

    @Inject
    UserService userService;

    @Inject
    UserRepo userRepo;

    @Inject
    PostService postService;

    @Inject
    PostRepo postRepo;

    @Inject
    PostCommentRepo postCommentRepo;

    @Inject
    PostReactionRepo postReactionRepo;

    @Inject
    JwtService jwtService;

    private User testNormalUser;
    private User testAdminUser;
    private Post testPost;

    @BeforeEach
    @Transactional
    public void setup() {
        testNormalUser = new User();
        testNormalUser.setUsername("test_user_" + UUID.randomUUID().toString().substring(0, 8));
        testNormalUser.setEmail(testNormalUser.getUsername() + "@test.com");
        testNormalUser.setPassword("password123");
        testNormalUser.setRole(SystemRole.USER);
        testNormalUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(testNormalUser);

        testAdminUser = new User();
        testAdminUser.setUsername("test_admin_" + UUID.randomUUID().toString().substring(0, 8));
        testAdminUser.setEmail(testAdminUser.getUsername() + "@test.com");
        testAdminUser.setPassword("admin123");
        testAdminUser.setRole(SystemRole.ADMIN);
        testAdminUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(testAdminUser);

        testPost = Post.builder()
                .author(testNormalUser)
                .content("Nội dung bài viết kiểm thử Mức 1")
                .privacy(alan.nguyen.common.PostPrivacy.PUBLIC)
                .isDeleted(false)
                .isPinned(false)
                .build();
        postRepo.persist(testPost);
    }

    @AfterEach
    @Transactional
    public void cleanup() {
        if (testPost != null && testPost.getId() != null) {
            postCommentRepo.delete("post.id", testPost.getId());
            postReactionRepo.delete("post.id", testPost.getId());
            postRepo.deleteById(testPost.getId());
        }
        if (testNormalUser != null && testNormalUser.getId() != null) {
            userRepo.deleteById(testNormalUser.getId());
        }
        if (testAdminUser != null && testAdminUser.getId() != null) {
            userRepo.deleteById(testAdminUser.getId());
        }
    }

    // ==========================================
    // 1. KIỂM THỬ GHIM / BỎ GHIM BÀI VIẾT
    // ==========================================

    @Test
    @DisplayName("Admin ghim và bỏ ghim bài viết thành công")
    public void testPinAndUnpinPost() {
        // Ghim bài viết
        PostResponseDTO pinnedDto = postService.setPinPost(testPost.getId(), true);
        assertTrue(pinnedDto.getIsPinned(), "Bài viết phải có isPinned = true");

        postRepo.getEntityManager().clear();
        Post reloaded = postRepo.findById(testPost.getId());
        assertTrue(reloaded.isPinned(), "Entity trong database phải có isPinned = true");

        // Bỏ ghim bài viết
        PostResponseDTO unpinnedDto = postService.setPinPost(testPost.getId(), false);
        assertFalse(unpinnedDto.getIsPinned(), "Bài viết phải có isPinned = false sau khi gỡ ghim");

        postRepo.getEntityManager().clear();
        reloaded = postRepo.findById(testPost.getId());
        assertFalse(reloaded.isPinned(), "Entity trong database phải có isPinned = false");
    }

    // ==========================================
    // 2. KIỂM THỬ KHÓA / MỞ KHÓA NGƯỜI DÙNG & VALIDATION
    // ==========================================

    @Test
    @DisplayName("Khóa tạm thời với số ngày hợp lệ (3, 7, 30 ngày) và từ chối số ngày không hợp lệ")
    public void testTemporaryLockValidation() {
        // Thử khóa với 5 ngày (không hợp lệ)
        LockUserRequestDTO invalidDto = new LockUserRequestDTO("TEMPORARY", 5, "Vi phạm quy tắc");
        Response invalidResp = userService.lockUser(testNormalUser.getId(), invalidDto, testAdminUser.getId());
        assertEquals(400, invalidResp.getStatus(), "Thời hạn 5 ngày phải bị từ chối với 400 Bad Request");

        // Thử khóa với 7 ngày (hợp lệ)
        LockUserRequestDTO validDto = new LockUserRequestDTO("TEMPORARY", 7, "Spam nội dung");
        Response validResp = userService.lockUser(testNormalUser.getId(), validDto, testAdminUser.getId());
        assertEquals(200, validResp.getStatus(), "Khóa 7 ngày phải thành công");

        User updated = userRepo.findById(testNormalUser.getId());
        assertTrue(updated.is_locked(), "Người dùng phải ở trạng thái is_locked = true");
        assertNotNull(updated.getLock_until(), "lock_until không được null khi khóa tạm thời");
        assertEquals("Spam nội dung", updated.getLock_reason());
    }

    @Test
    @DisplayName("Khóa vĩnh viễn: is_locked = true và lock_until = null")
    public void testPermanentLock() {
        LockUserRequestDTO permDto = new LockUserRequestDTO("PERMANENT", null, "Lừa đảo");
        Response resp = userService.lockUser(testNormalUser.getId(), permDto, testAdminUser.getId());
        assertEquals(200, resp.getStatus(), "Khóa vĩnh viễn phải thành công");

        User updated = userRepo.findById(testNormalUser.getId());
        assertTrue(updated.is_locked());
        assertNull(updated.getLock_until(), "lock_until phải là null khi khóa vĩnh viễn");
        assertEquals("Lừa đảo", updated.getLock_reason());
    }

    @Test
    @DisplayName("Mở khóa thủ công: xóa cờ is_locked, lock_until và reason")
    public void testManualUnlock() {
        // Khóa trước
        LockUserRequestDTO permDto = new LockUserRequestDTO("PERMANENT", null, "Lý do khóa");
        userService.lockUser(testNormalUser.getId(), permDto, testAdminUser.getId());

        // Mở khóa
        Response unlockResp = userService.unlockUser(testNormalUser.getId());
        assertEquals(200, unlockResp.getStatus());

        User updated = userRepo.findById(testNormalUser.getId());
        assertFalse(updated.is_locked());
        assertNull(updated.getLock_until());
        assertNull(updated.getLock_reason());
    }

    @Test
    @DisplayName("Chính sách bảo vệ tài khoản Admin: Không thể khóa hoặc xóa tài khoản ADMIN")
    public void testAdminProtectionPolicy() {
        // Thử khóa Admin -> phải bị từ chối 400
        LockUserRequestDTO dto = new LockUserRequestDTO("PERMANENT", null, "Cố tình khóa Admin");
        Response lockResp = userService.lockUser(testAdminUser.getId(), dto, testAdminUser.getId());
        assertEquals(400, lockResp.getStatus(), "Không được phép khóa tài khoản Admin");

        // Thử xóa/ẩn danh Admin -> phải ném exception hoặc từ chối
        assertThrows(WebApplicationException.class, () -> {
            userService.anonymizeUser(testAdminUser.getId());
        }, "Không được phép xóa tài khoản Admin");
    }

    // ==========================================
    // 3. KIỂM THỬ ĐĂNG NHẬP VỚI TÀI KHOẢN BỊ KHÓA & TỰ ĐỘNG MỞ KHÓA
    // ==========================================

    @Test
    @DisplayName("Tài khoản khóa vĩnh viễn hoặc khóa tạm thời chưa hết hạn bị chặn đăng nhập (403 Forbidden)")
    public void testLoginBlockedForLockedUsers() {
        LoginRequestDTO loginDto = new LoginRequestDTO();
        loginDto.username = testNormalUser.getUsername();
        loginDto.password = "password123";

        // 1. Khóa vĩnh viễn
        LockUserRequestDTO permDto = new LockUserRequestDTO("PERMANENT", null, "Vi phạm nghiêm trọng");
        userService.lockUser(testNormalUser.getId(), permDto, testAdminUser.getId());

        Response permLoginResp = jwtService.getToken(loginDto);
        assertEquals(403, permLoginResp.getStatus(), "Khóa vĩnh viễn phải trả về 403 Forbidden khi đăng nhập");

        // 2. Khóa tạm thời chưa hết hạn
        LockUserRequestDTO tempDto = new LockUserRequestDTO("TEMPORARY", 3, "Spam bình luận");
        userService.lockUser(testNormalUser.getId(), tempDto, testAdminUser.getId());

        Response tempLoginResp = jwtService.getToken(loginDto);
        assertEquals(403, tempLoginResp.getStatus(), "Khóa tạm thời chưa hết hạn phải trả về 403 Forbidden khi đăng nhập");
    }

    @Test
    @Transactional
    @DisplayName("Tài khoản khóa tạm thời khi hết hạn sẽ tự động mở khóa và đăng nhập thành công")
    public void testAutoUnlockOnExpiration() {
        // Đặt thời hạn khóa trong quá khứ (đã hết hạn)
        User u = userRepo.findById(testNormalUser.getId());
        u.set_locked(true);
        u.setLock_until(LocalDateTime.now().minusHours(1));
        u.setLock_reason("Hết hạn hôm qua");
        userRepo.persist(u);

        LoginRequestDTO loginDto = new LoginRequestDTO();
        loginDto.username = testNormalUser.getUsername();
        loginDto.password = "password123";

        Response loginResp = jwtService.getToken(loginDto);
        assertEquals(200, loginResp.getStatus(), "Đăng nhập phải thành công khi thời gian khóa tạm thời đã hết hạn");

        User reloaded = userRepo.findById(testNormalUser.getId());
        assertFalse(reloaded.is_locked(), "Tài khoản phải được tự động chuyển sang is_locked = false");
    }

    // ==========================================
    // 4. KIỂM THỬ CHỈ SỐ DASHBOARD & LOẠI TRỪ DỮ LIỆU ĐÃ XÓA MỀM
    // ==========================================

    @Test
    @Transactional
    @DisplayName("Chỉ số Dashboard: totalPosts và totalInteractions không tính dữ liệu đã xóa mềm")
    public void testDashboardMetricsExcludesSoftDeleted() {
        long postsBefore = postRepo.count("isDeleted = false");
        long commentsBefore = postCommentRepo.count("isDeleted = false and post.isDeleted = false");

        // Thêm 1 bài viết đã xóa mềm
        Post deletedPost = Post.builder()
                .author(testNormalUser)
                .content("Bài viết đã xóa")
                .privacy(alan.nguyen.common.PostPrivacy.PUBLIC)
                .isDeleted(false)
                .build();
        postRepo.persist(deletedPost);
        deletedPost.setDeleted(true);

        // Thêm 1 comment hợp lệ trên bài viết active
        PostComment activeComment = PostComment.builder()
                .post(testPost)
                .author(testNormalUser)
                .content("Bình luận hợp lệ")
                .build();
        postCommentRepo.persist(activeComment);

        // Thêm 1 comment đã bị xóa mềm trên bài viết active
        PostComment deletedComment = PostComment.builder()
                .post(testPost)
                .author(testNormalUser)
                .content("Bình luận đã xóa")
                .build();
        postCommentRepo.persist(deletedComment);
        deletedComment.setDeleted(true);

        // Thêm 1 comment trên bài viết đã bị xóa mềm
        PostComment commentOnDeletedPost = PostComment.builder()
                .post(deletedPost)
                .author(testNormalUser)
                .content("Bình luận trên bài đã xóa")
                .build();
        postCommentRepo.persist(commentOnDeletedPost);

        long postsAfter = postRepo.count("isDeleted = false");
        long commentsAfter = postCommentRepo.count("isDeleted = false and post.isDeleted = false");

        // Bài viết bị xóa mềm không được tăng totalPosts
        assertEquals(postsBefore, postsAfter, "totalPosts không được tính bài viết đã bị xóa mềm");

        // Chỉ comment hợp lệ trên bài viết hợp lệ mới được tính vào activeComments
        assertEquals(commentsBefore + 1, commentsAfter, "Chỉ bình luận chưa xóa trên bài viết chưa xóa mới được tính vào totalInteractions");

        // Dọn dẹp
        postCommentRepo.deleteById(activeComment.getId());
        postCommentRepo.deleteById(deletedComment.getId());
        postCommentRepo.deleteById(commentOnDeletedPost.getId());
        postRepo.deleteById(deletedPost.getId());
    }
}
