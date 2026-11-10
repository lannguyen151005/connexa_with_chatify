package alan.nguyen;

import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.connexa.post.CreatePostRequestDTO;
import alan.nguyen.dto.connexa.post.PostResponseDTO;
import alan.nguyen.dto.connexa.post.UpdatePostRequestDTO;
import alan.nguyen.dto.moderation.PostModerationResult;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.Report;
import alan.nguyen.entity.User;
import alan.nguyen.repository.PostRepo;
import alan.nguyen.repository.ReportRepo;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.PostService;
import alan.nguyen.service.ReportService;
import alan.nguyen.service.moderation.PostModerationClassifier;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class PostAiModerationTest {

    @Inject
    PostService postService;

    @Inject
    ReportService reportService;

    @Inject
    PostRepo postRepo;

    @Inject
    ReportRepo reportRepo;

    @Inject
    UserRepo userRepo;

    private User normalUser;
    private User adminUser;
    private final List<UUID> createdPostIds = new ArrayList<>();

    private static volatile Function<String, PostModerationResult> mockBehavior =
            content -> PostModerationResult.clean();
    private static final AtomicInteger classifierCalls = new AtomicInteger(0);

    @BeforeEach
    @Transactional
    public void setup() {
        classifierCalls.set(0);
        mockBehavior = content -> PostModerationResult.clean();

        QuarkusMock.installMockForType(new PostModerationClassifier() {
            @Override
            public PostModerationResult classify(String content, List<String> hashtags) {
                classifierCalls.incrementAndGet();
                return mockBehavior.apply(content);
            }
        }, PostModerationClassifier.class);

        normalUser = new User();
        normalUser.setUsername("mod_user_" + UUID.randomUUID().toString().substring(0, 8));
        normalUser.setEmail(normalUser.getUsername() + "@test.com");
        normalUser.setPassword("pass123");
        normalUser.setRole(SystemRole.USER);
        normalUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(normalUser);

        adminUser = new User();
        adminUser.setUsername("mod_admin_" + UUID.randomUUID().toString().substring(0, 8));
        adminUser.setEmail(adminUser.getUsername() + "@test.com");
        adminUser.setPassword("admin123");
        adminUser.setRole(SystemRole.ADMIN);
        adminUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(adminUser);

        createdPostIds.clear();
    }

    @AfterEach
    @Transactional
    public void cleanup() {
        mockBehavior = content -> PostModerationResult.clean();

        for (UUID postId : createdPostIds) {
            reportRepo.delete("targetId = ?1", postId);
            postRepo.deleteById(postId);
        }
        if (adminUser != null && adminUser.getId() != null) {
            reportRepo.delete("resolvedBy.id = ?1", adminUser.getId());
            userRepo.deleteById(adminUser.getId());
        }
        if (normalUser != null && normalUser.getId() != null) {
            userRepo.deleteById(normalUser.getId());
        }
    }

    private <T> T waitUntil(Supplier<Optional<T>> check, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            Optional<T> found = QuarkusTransaction.requiringNew().call(check::get);
            if (found.isPresent()) {
                return found.get();
            }
            Thread.sleep(50);
        }
        return QuarkusTransaction.requiringNew().call(check::get).orElse(null);
    }

    private void waitForCondition(Supplier<Boolean> condition, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            if (Boolean.TRUE.equals(QuarkusTransaction.requiringNew().call(condition::get))) {
                return;
            }
            Thread.sleep(50);
        }
        assertTrue(Boolean.TRUE.equals(QuarkusTransaction.requiringNew().call(condition::get)),
                "Điều kiện bất đồng bộ không đạt trong thời gian chờ");
    }

    @Test
    @DisplayName("Parser xử lý an toàn block <think>, markdown fence, giới hạn confidence và dữ liệu lỗi")
    public void testParseAiResponse_DefensiveParsing() {
        PostModerationClassifier parser = new PostModerationClassifier(new ObjectMapper());
        PostModerationResult qwenStyle = parser.parseAiResponse("""
                <think>Người dùng rủ rê chuyển khoản cọc trước đáng ngờ.</think>
                ```json
                {"flagged": true, "category": "scam", "confidence": 1.35, "reason": "Nghi vấn lừa đảo chuyển khoản"}
                ```
                """);
        assertTrue(qwenStyle.flagged());
        assertEquals("SCAM", qwenStyle.category());
        assertEquals(1.0, qwenStyle.confidence());
        assertEquals("Nghi vấn lừa đảo chuyển khoản", qwenStyle.reason());

        PostModerationResult unknownCat = parser.parseAiResponse(
                "{\"flagged\": true, \"category\": \"CUSTOM_CAT\", \"confidence\": -0.5, \"reason\": \"Lý do\"}");
        assertTrue(unknownCat.flagged());
        assertEquals("OTHER", unknownCat.category());
        assertEquals(0.0, unknownCat.confidence());

        PostModerationResult malformed = parser.parseAiResponse("Không thể phân tích nội dung này");
        assertFalse(malformed.flagged());
        assertEquals("NONE", malformed.category());
        assertEquals(0.0, malformed.confidence());
    }

    @Test
    @DisplayName("Đăng bài vi phạm tạo đơn AI_MODERATION bất đồng bộ, sửa bài cập nhật đơn và không tạo trùng")
    public void testCreateAndEditPost_AsyncModerationLifecycle() throws InterruptedException {
        mockBehavior = content -> new PostModerationResult(
                true, "SCAM", 0.92, "Phát hiện nội dung rủ rê đầu tư lợi nhuận cao bất thường");

        PostResponseDTO created = postService.createPost(normalUser.getId(), CreatePostRequestDTO.builder()
                .content("Cơ hội đầu tư lợi nhuận 300 phần trăm mỗi ngày, chuyển khoản ngay")
                .privacy(PostPrivacy.PUBLIC)
                .build());
        createdPostIds.add(created.getId());

        Report createdAiReport = waitUntil(
                () -> reportRepo.findPendingAiReport(ReportTargetType.POST, created.getId()),
                5000);
        assertNotNull(createdAiReport, "Phải tự động tạo đơn AI_MODERATION sau khi đăng bài vi phạm");
        assertEquals(ReportSource.AI_MODERATION, createdAiReport.getSource());
        assertNull(createdAiReport.getReporter());
        assertEquals("SCAM", createdAiReport.getReason());
        assertEquals(0.92, createdAiReport.getAiConfidence());

        // Chỉnh sửa bài vẫn vi phạm sang nhóm SPAM -> phải cập nhật đơn PENDING hiện có, không tạo thêm đơn thứ 2
        mockBehavior = content -> new PostModerationResult(
                true, "SPAM", 0.85, "Spam quảng cáo lặp lại");

        postService.updatePost(normalUser.getId(), created.getId(), UpdatePostRequestDTO.builder()
                .content("Spam quảng cáo bán sim số đẹp giá rẻ liên hệ ngay")
                .privacy(PostPrivacy.PUBLIC)
                .build());

        waitForCondition(() -> {
            Optional<Report> rep = reportRepo.findPendingAiReport(ReportTargetType.POST, created.getId());
            return rep.isPresent() && "SPAM".equals(rep.get().getReason());
        }, 5000);

        long totalAiPending = QuarkusTransaction.requiringNew().call(() ->
                reportRepo.count("targetId = ?1 and source = ?2 and status = ?3",
                        created.getId(), ReportSource.AI_MODERATION, ReportStatus.PENDING));
        assertEquals(1, totalAiPending, "Không được tạo trùng nhiều đơn AI_MODERATION PENDING trên cùng 1 bài");

        // Chỉnh sửa bài sang nội dung sạch -> vẫn giữ đơn PENDING để Admin xem xét, bổ sung ghi chú
        mockBehavior = content -> PostModerationResult.clean();
        postService.updatePost(normalUser.getId(), created.getId(), UpdatePostRequestDTO.builder()
                .content("Hôm nay thời tiết thật dễ chịu, chúc mọi người học tốt")
                .privacy(PostPrivacy.PUBLIC)
                .build());

        waitForCondition(() -> {
            Optional<Report> rep = reportRepo.findPendingAiReport(ReportTargetType.POST, created.getId());
            return rep.isPresent()
                    && rep.get().getDetails() != null
                    && rep.get().getDetails().contains("Cập nhật sau chỉnh sửa");
        }, 5000);
    }

    @Test
    @DisplayName("Bỏ qua bài PRIVATE/ADMIN/dưới ngưỡng và đăng bài vẫn thành công khi AI lỗi")
    public void testSkipsAndResilience() throws InterruptedException {
        mockBehavior = content -> new PostModerationResult(true, "HARASSMENT", 0.95, "Vi phạm");

        // 1. Bài của ADMIN -> không gọi AI
        PostResponseDTO adminPost = postService.createPost(adminUser.getId(), CreatePostRequestDTO.builder()
                .content("Thông báo quản trị hệ thống")
                .privacy(PostPrivacy.PUBLIC)
                .build());
        createdPostIds.add(adminPost.getId());

        // 2. Bài PRIVATE -> không gọi AI
        PostResponseDTO privatePost = postService.createPost(normalUser.getId(), CreatePostRequestDTO.builder()
                .content("Ghi chú cá nhân nhạy cảm")
                .privacy(PostPrivacy.PRIVATE)
                .build());
        createdPostIds.add(privatePost.getId());

        Thread.sleep(250);
        assertEquals(0, classifierCalls.get(), "Bài của ADMIN và bài PRIVATE không được gọi AI");

        // 3. Chuyển bài PRIVATE sang PUBLIC -> bắt đầu quét AI và gắn cờ
        postService.updatePost(normalUser.getId(), privatePost.getId(), UpdatePostRequestDTO.builder()
                .content("Ghi chú cá nhân nhạy cảm")
                .privacy(PostPrivacy.PUBLIC)
                .build());

        Report flaggedAfterPublic = waitUntil(
                () -> reportRepo.findPendingAiReport(ReportTargetType.POST, privatePost.getId()),
                5000);
        assertNotNull(flaggedAfterPublic, "Bài chuyển từ PRIVATE sang PUBLIC phải được AI kiểm tra");

        // 4. AI trả về confidence dưới ngưỡng 0.70 -> không tạo đơn
        mockBehavior = content -> new PostModerationResult(true, "SPAM", 0.55, "Nghi ngờ nhẹ");
        PostResponseDTO lowConfPost = postService.createPost(normalUser.getId(), CreatePostRequestDTO.builder()
                .content("Bài viết nghi ngờ nhẹ dưới ngưỡng")
                .privacy(PostPrivacy.PUBLIC)
                .build());
        createdPostIds.add(lowConfPost.getId());

        waitForCondition(() -> classifierCalls.get() >= 2, 5000);
        Thread.sleep(150);
        assertTrue(QuarkusTransaction.requiringNew().call(() ->
                reportRepo.findPendingAiReport(ReportTargetType.POST, lowConfPost.getId()).isEmpty()));

        // 5. AI ném ngoại lệ -> đăng bài vẫn phải thành công bình thường
        mockBehavior = content -> {
            throw new RuntimeException("Simulated Groq 429 Rate Limit");
        };
        PostResponseDTO resilientPost = postService.createPost(normalUser.getId(), CreatePostRequestDTO.builder()
                .content("Bài đăng bình thường khi AI đang quá tải")
                .privacy(PostPrivacy.PUBLIC)
                .build());
        createdPostIds.add(resilientPost.getId());
        assertNotNull(resilientPost.getId());
        waitForCondition(() -> classifierCalls.get() >= 3, 5000);
    }

    @Test
    @DisplayName("Sau khi Admin bác bỏ báo cáo AI, nếu tác giả sửa bài vẫn vi phạm sẽ được quét lại")
    public void testReEvaluationAfterDismiss() throws InterruptedException {
        mockBehavior = content -> new PostModerationResult(true, "SPAM", 0.89, "Quảng cáo rác");

        PostResponseDTO post = postService.createPost(normalUser.getId(), CreatePostRequestDTO.builder()
                .content("Quảng cáo bán khóa học làm giàu siêu tốc")
                .privacy(PostPrivacy.PUBLIC)
                .build());
        createdPostIds.add(post.getId());

        Report firstReport = waitUntil(
                () -> reportRepo.findPendingAiReport(ReportTargetType.POST, post.getId()),
                5000);
        assertNotNull(firstReport);

        reportService.dismissReport(adminUser.getId(), firstReport.getId(),
                DismissReportRequestDTO.builder().resolutionNotes("Không vi phạm").build());

        // Tác giả sửa nội dung tiếp tục vi phạm -> tạo đơn PENDING mới
        mockBehavior = content -> new PostModerationResult(true, "SCAM", 0.94, "Lừa đảo chuyển tiền");
        postService.updatePost(normalUser.getId(), post.getId(), UpdatePostRequestDTO.builder()
                .content("Chuyển khoản ngay 500k để nhận thưởng 50 triệu")
                .privacy(PostPrivacy.PUBLIC)
                .build());

        Report secondReport = waitUntil(
                () -> reportRepo.findPendingAiReport(ReportTargetType.POST, post.getId()),
                5000);
        assertNotNull(secondReport);
        assertNotEquals(firstReport.getId(), secondReport.getId());
        assertEquals("SCAM", secondReport.getReason());
    }
}
