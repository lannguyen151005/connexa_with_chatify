package alan.nguyen;

import alan.nguyen.common.NortificationType;
import alan.nguyen.common.PostMediaType;
import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.ReportActionTaken;
import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.AdminDashboardRecentReportDTO;
import alan.nguyen.dto.admin.AdminReportResponseDTO;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.admin.LockUserRequestDTO;
import alan.nguyen.dto.admin.ResolveReportRequestDTO;
import alan.nguyen.dto.report.CreateReportRequestDTO;
import alan.nguyen.dto.report.ReportResponseDTO;
import alan.nguyen.entity.Notification;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.PostComment;
import alan.nguyen.entity.PostMedia;
import alan.nguyen.entity.Report;
import alan.nguyen.entity.User;
import alan.nguyen.repository.*;
import alan.nguyen.service.ReportService;
import alan.nguyen.service.UserService;
import alan.nguyen.service.auth.JwtService;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class AdminTier2ReportsTest {

    @Inject
    ReportService reportService;

    @Inject
    ReportRepo reportRepo;

    @Inject
    UserRepo userRepo;

    @Inject
    PostRepo postRepo;

    @Inject
    PostCommentRepo postCommentRepo;

    @Inject
    NotificationRepo notificationRepo;

    @Inject
    UserService userService;

    @Inject
    JwtService jwtService;

    private User reporterUser;
    private User badUser;
    private User adminUser;
    private Post testPost;
    private PostComment testComment;
    private final List<UUID> extraPostIds = new ArrayList<>();
    private final List<UUID> extraReportIds = new ArrayList<>();

    @BeforeEach
    @Transactional
    public void setup() {
        reporterUser = new User();
        reporterUser.setUsername("reporter_" + UUID.randomUUID().toString().substring(0, 8));
        reporterUser.setEmail(reporterUser.getUsername() + "@test.com");
        reporterUser.setPassword("pass123");
        reporterUser.setRole(SystemRole.USER);
        reporterUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(reporterUser);

        badUser = new User();
        badUser.setUsername("baduser_" + UUID.randomUUID().toString().substring(0, 8));
        badUser.setEmail(badUser.getUsername() + "@test.com");
        badUser.setPassword("pass123");
        badUser.setRole(SystemRole.USER);
        badUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(badUser);

        adminUser = new User();
        adminUser.setUsername("admin_" + UUID.randomUUID().toString().substring(0, 8));
        adminUser.setEmail(adminUser.getUsername() + "@test.com");
        adminUser.setPassword("admin123");
        adminUser.setRole(SystemRole.ADMIN);
        adminUser.setCreated_at(LocalDateTime.now());
        userRepo.persist(adminUser);

        testPost = Post.builder()
                .author(badUser)
                .content("Nội dung bài viết vi phạm tiêu chuẩn cộng đồng")
                .privacy(alan.nguyen.common.PostPrivacy.PUBLIC)
                .comment_count(1)
                .isDeleted(false)
                .build();
        postRepo.persist(testPost);

        testComment = PostComment.builder()
                .post(testPost)
                .author(badUser)
                .content("Bình luận xúc phạm người khác")
                .build();
        postCommentRepo.persist(testComment);

        extraPostIds.clear();
        extraReportIds.clear();
    }

    @AfterEach
    @Transactional
    public void cleanup() {
        for (UUID reportId : extraReportIds) {
            reportRepo.deleteById(reportId);
        }
        if (testPost != null && testPost.getId() != null) {
            reportRepo.delete("targetId = ?1", testPost.getId());
        }
        if (testComment != null && testComment.getId() != null) {
            reportRepo.delete("targetId = ?1", testComment.getId());
        }
        if (reporterUser != null && reporterUser.getId() != null) {
            reportRepo.delete("reporter.id = ?1 or resolvedBy.id = ?1", reporterUser.getId());
        }
        if (badUser != null && badUser.getId() != null) {
            reportRepo.delete("reporter.id = ?1 or resolvedBy.id = ?1", badUser.getId());
            notificationRepo.delete("receiver_id = ?1 or actor_id = ?1", badUser.getId());
        }
        if (adminUser != null && adminUser.getId() != null) {
            reportRepo.delete("reporter.id = ?1 or resolvedBy.id = ?1", adminUser.getId());
            notificationRepo.delete("receiver_id = ?1 or actor_id = ?1", adminUser.getId());
        }

        if (testComment != null && testComment.getId() != null) {
            postCommentRepo.deleteById(testComment.getId());
        }
        if (testPost != null && testPost.getId() != null) {
            postRepo.deleteById(testPost.getId());
        }
        for (UUID postId : extraPostIds) {
            reportRepo.delete("targetId = ?1", postId);
            postRepo.deleteById(postId);
        }
        if (reporterUser != null && reporterUser.getId() != null) {
            userRepo.deleteById(reporterUser.getId());
        }
        if (badUser != null && badUser.getId() != null) {
            userRepo.deleteById(badUser.getId());
        }
        if (adminUser != null && adminUser.getId() != null) {
            userRepo.deleteById(adminUser.getId());
        }
    }

    @Test
    @DisplayName("Người dùng gửi báo cáo thành công và kích hoạt cơ chế chống spam khi gửi liên tiếp")
    public void testCreateReportAndAntiSpam() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Nội dung spam quảng cáo")
                .details("Bài viết phát tán link lạ")
                .build();

        ReportResponseDTO res = reportService.createReport(reporterUser.getId(), dto);
        assertNotNull(res.getId());
        assertEquals(ReportStatus.PENDING, res.getStatus());
        assertEquals("Nội dung spam quảng cáo", res.getReason());

        // Gửi tiếp đơn thứ 2 cho cùng 1 bài viết khi đơn cũ còn PENDING -> phải ném BadRequestException
        assertThrows(BadRequestException.class, () -> {
            reportService.createReport(reporterUser.getId(), dto);
        }, "Phải từ chối gửi báo cáo trùng lặp khi đơn trước còn PENDING");
    }

    @Test
    @DisplayName("Từ chối báo cáo đối tượng không tồn tại hoặc tự báo cáo chính mình")
    public void testValidateTarget() {
        // Báo cáo bài viết không tồn tại
        CreateReportRequestDTO notFoundPost = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(UUID.randomUUID())
                .reason("Spam")
                .build();
        assertThrows(NotFoundException.class, () -> {
            reportService.createReport(reporterUser.getId(), notFoundPost);
        });

        // Tự báo cáo chính mình
        CreateReportRequestDTO selfReport = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.USER)
                .targetId(reporterUser.getId())
                .reason("Tự báo cáo")
                .build();
        assertThrows(BadRequestException.class, () -> {
            reportService.createReport(reporterUser.getId(), selfReport);
        });
    }

    @Test
    @DisplayName("Admin lấy danh sách báo cáo vi phạm kèm thông tin xem trước (targetPreview)")
    public void testAdminGetReports() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Kích động thù địch")
                .build();
        reportService.createReport(reporterUser.getId(), dto);

        PageResponseDTO<AdminReportResponseDTO> result = reportService.getAdminReports(
                ReportStatus.PENDING, ReportTargetType.POST, 0, 10
        );

        assertNotNull(result);
        assertTrue(result.items().size() > 0);
        AdminReportResponseDTO item = result.items().get(0);
        assertEquals(ReportTargetType.POST, item.getTargetType());
        assertNotNull(item.getTargetPreview());
        assertEquals(testPost.getContent(), item.getTargetPreview().getContent());
        assertEquals(badUser.getUsername(), item.getTargetPreview().getAuthor().getUsername());
    }

    @Test
    @DisplayName("Admin giải quyết báo cáo với hành động REMOVE_CONTENT (gỡ bài viết)")
    public void testResolveReport_RemoveContent_Post() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Bài viết lừa đảo")
                .build();
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), dto);

        ResolveReportRequestDTO resolveDto = ResolveReportRequestDTO.builder()
                .actionTaken(ReportActionTaken.REMOVE_CONTENT)
                .resolutionNotes("Xác nhận lừa đảo, gỡ bài viết")
                .build();

        reportService.resolveReport(adminUser.getId(), rep.getId(), resolveDto);

        Report updatedReport = reportRepo.findById(rep.getId());
        assertEquals(ReportStatus.RESOLVED, updatedReport.getStatus());
        assertEquals(ReportActionTaken.REMOVE_CONTENT, updatedReport.getActionTaken());
        assertNotNull(updatedReport.getResolvedAt());
        assertEquals(adminUser.getId(), updatedReport.getResolvedBy().getId());

        // Kiểm tra bài viết đã bị đánh dấu xóa mềm
        postRepo.getEntityManager().clear();
        Post postInDb = postRepo.findById(testPost.getId());
        assertTrue(postInDb.is_deleted(), "Bài viết phải được đánh dấu xóa mềm is_deleted = true");
    }

    @Test
    @DisplayName("Admin giải quyết báo cáo với hành động REMOVE_CONTENT (gỡ bình luận)")
    public void testResolveReport_RemoveContent_Comment() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.COMMENT)
                .targetId(testComment.getId())
                .reason("Bình luận phản cảm")
                .build();
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), dto);

        ResolveReportRequestDTO resolveDto = ResolveReportRequestDTO.builder()
                .actionTaken(ReportActionTaken.REMOVE_CONTENT)
                .resolutionNotes("Gỡ bình luận vi phạm")
                .build();

        reportService.resolveReport(adminUser.getId(), rep.getId(), resolveDto);

        postCommentRepo.getEntityManager().clear();
        PostComment commentInDb = postCommentRepo.findById(testComment.getId());
        assertTrue(commentInDb.isDeleted(), "Bình luận phải được đánh dấu isDeleted = true");

        Post postInDb = postRepo.findById(testPost.getId());
        assertEquals(0, postInDb.getComment_count(), "comment_count của bài viết phải giảm đi 1 sau khi gỡ bình luận");
    }

    @Test
    @DisplayName("Admin giải quyết báo cáo với hành động LOCK_USER (khóa người dùng)")
    public void testResolveReport_LockUser() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.USER)
                .targetId(badUser.getId())
                .reason("Tài khoản lừa đảo tiền sinh viên")
                .build();
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), dto);

        ResolveReportRequestDTO resolveDto = ResolveReportRequestDTO.builder()
                .actionTaken(ReportActionTaken.LOCK_USER)
                .resolutionNotes("Khóa tài khoản 7 ngày để điều tra")
                .build();

        reportService.resolveReport(adminUser.getId(), rep.getId(), resolveDto);

        userRepo.getEntityManager().clear();
        User locked = userRepo.findById(badUser.getId());
        assertTrue(locked.is_locked(), "Người dùng phải bị khóa sau khi Admin áp dụng LOCK_USER");
        assertNotNull(locked.getLock_until());
    }

    @Test
    @DisplayName("Admin giải quyết báo cáo với hành động WARN_USER (gửi thông báo cảnh cáo)")
    public void testResolveReport_WarnUser() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Ngôn từ gây hấn")
                .build();
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), dto);

        ResolveReportRequestDTO resolveDto = ResolveReportRequestDTO.builder()
                .actionTaken(ReportActionTaken.WARN_USER)
                .resolutionNotes("Cảnh cáo lần 1")
                .build();

        reportService.resolveReport(adminUser.getId(), rep.getId(), resolveDto);

        // Kiểm tra đã tạo thông báo cảnh cáo kèm nội dung message cho tác giả bài viết
        Notification warning = notificationRepo.find("receiver_id = ?1 and type = ?2",
                badUser.getId(), NortificationType.SYSTEM_WARNING).firstResult();
        assertNotNull(warning, "Phải có thông báo SYSTEM_WARNING gửi về cho người dùng bị cảnh cáo");
        assertEquals("Cảnh cáo lần 1", warning.getMessage());
    }

    @Test
    @DisplayName("Admin bác bỏ báo cáo vi phạm (DISMISSED)")
    public void testDismissReport() {
        CreateReportRequestDTO dto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Nội dung không hợp ý tôi")
                .build();
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), dto);

        DismissReportRequestDTO dismissDto = DismissReportRequestDTO.builder()
                .resolutionNotes("Nội dung bình thường, không có dấu hiệu vi phạm")
                .build();

        reportService.dismissReport(adminUser.getId(), rep.getId(), dismissDto);

        Report dismissed = reportRepo.findById(rep.getId());
        assertEquals(ReportStatus.DISMISSED, dismissed.getStatus());
        assertEquals(ReportActionTaken.DISMISSED, dismissed.getActionTaken());
        assertNotNull(dismissed.getResolvedAt());

        // Bài viết không bị ảnh hưởng
        postRepo.getEntityManager().clear();
        Post postInDb = postRepo.findById(testPost.getId());
        assertFalse(postInDb.is_deleted(), "Bài viết không được bị xóa khi báo cáo bị bác bỏ");
    }

    @Test
    @DisplayName("Chặn tự báo cáo bài viết/bình luận của chính mình và chặn báo cáo bài viết không có quyền xem")
    public void testCreateReport_SelfAndPrivacyValidation() {
        // Tự báo cáo bài viết của chính mình -> BadRequestException
        CreateReportRequestDTO selfPostDto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("Tự báo cáo bài viết")
                .build();
        assertThrows(BadRequestException.class, () ->
                reportService.createReport(badUser.getId(), selfPostDto));

        // Tự báo cáo bình luận của chính mình -> BadRequestException
        CreateReportRequestDTO selfCommentDto = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.COMMENT)
                .targetId(testComment.getId())
                .reason("Tự báo cáo bình luận")
                .build();
        assertThrows(BadRequestException.class, () ->
                reportService.createReport(badUser.getId(), selfCommentDto));

        // Bài viết PRIVATE của badUser -> reporterUser không có quyền xem nên bị chặn ForbiddenException
        UUID privatePostId = QuarkusTransaction.requiringNew().call(() -> {
            User author = userRepo.findById(badUser.getId());
            Post p = Post.builder()
                    .author(author)
                    .content("Bài viết riêng tư")
                    .privacy(PostPrivacy.PRIVATE)
                    .isDeleted(false)
                    .build();
            postRepo.persist(p);
            return p.getId();
        });
        extraPostIds.add(privatePostId);

        CreateReportRequestDTO privatePostReport = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(privatePostId)
                .reason("Spam")
                .build();
        assertThrows(ForbiddenException.class, () ->
                reportService.createReport(reporterUser.getId(), privatePostReport));

        // Bài viết FRIENDS_ONLY của badUser -> reporterUser chưa kết bạn nên bị chặn ForbiddenException
        UUID friendsPostId = QuarkusTransaction.requiringNew().call(() -> {
            User author = userRepo.findById(badUser.getId());
            Post p = Post.builder()
                    .author(author)
                    .content("Bài viết chỉ dành cho bạn bè")
                    .privacy(PostPrivacy.FRIENDS_ONLY)
                    .isDeleted(false)
                    .build();
            postRepo.persist(p);
            return p.getId();
        });
        extraPostIds.add(friendsPostId);

        CreateReportRequestDTO friendsPostReport = CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(friendsPostId)
                .reason("Spam")
                .build();
        assertThrows(ForbiddenException.class, () ->
                reportService.createReport(reporterUser.getId(), friendsPostReport));
    }

    @Test
    @DisplayName("Lọc báo cáo theo source AI_MODERATION, keyword, kèm mediaList trong preview và recentReports")
    public void testAdminGetReports_SourceKeywordAndMediaPreview() {
        QuarkusTransaction.requiringNew().run(() -> {
            Post post = postRepo.findById(testPost.getId());
            post.addMedia(PostMedia.builder()
                    .media_url("https://res.cloudinary.com/demo/image/upload/sample.jpg")
                    .media_type(PostMediaType.IMAGE)
                    .display_order(0)
                    .build());
            postRepo.persist(post);

            Report aiReport = Report.builder()
                    .reporter(null)
                    .source(ReportSource.AI_MODERATION)
                    .aiConfidence(0.91)
                    .targetType(ReportTargetType.POST)
                    .targetId(post.getId())
                    .reason("SCAM")
                    .details("Phát hiện dấu hiệu lừa đảo chuyển khoản")
                    .status(ReportStatus.PENDING)
                    .build();
            reportRepo.persist(aiReport);
            extraReportIds.add(aiReport.getId());
        });

        // Tạo thêm 1 báo cáo từ USER để kiểm tra bộ lọc tách nguồn
        reportService.createReport(reporterUser.getId(), CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("SPAM")
                .details("Tin rác")
                .build());

        PageResponseDTO<AdminReportResponseDTO> aiOnly = reportService.getAdminReports(
                ReportStatus.PENDING, ReportTargetType.POST, ReportSource.AI_MODERATION, "Lừa đảo", 0, 10);

        assertEquals(1, aiOnly.items().size(), "Chỉ trả về đúng 1 báo cáo AI khớp từ khóa");
        AdminReportResponseDTO dto = aiOnly.items().get(0);
        assertEquals(ReportSource.AI_MODERATION, dto.getSource());
        assertEquals(0.91, dto.getAiConfidence());
        assertNull(dto.getReporter());
        assertNotNull(dto.getTargetPreview());
        assertEquals(1, dto.getTargetPreview().getMediaList().size());
        assertEquals("https://res.cloudinary.com/demo/image/upload/sample.jpg",
                dto.getTargetPreview().getMediaList().get(0).getMedia_url());

        List<AdminDashboardRecentReportDTO> recent = reportService.getRecentPendingReports(5);
        assertTrue(recent.stream().anyMatch(r ->
                "AI Kiểm duyệt".equals(r.getReporterName()) && ReportSource.AI_MODERATION == r.getSource()));
    }

    @Test
    @DisplayName("Gỡ nội dung vi phạm tự động đóng các đơn PENDING trùng mục tiêu")
    public void testResolveReport_RemoveContent_AutoClosesDuplicates() {
        UUID aiReportId = QuarkusTransaction.requiringNew().call(() -> {
            Report aiReport = Report.builder()
                    .reporter(null)
                    .source(ReportSource.AI_MODERATION)
                    .aiConfidence(0.88)
                    .targetType(ReportTargetType.POST)
                    .targetId(testPost.getId())
                    .reason("SPAM")
                    .details("AI nghi ngờ spam")
                    .status(ReportStatus.PENDING)
                    .build();
            reportRepo.persist(aiReport);
            extraReportIds.add(aiReport.getId());
            return aiReport.getId();
        });

        ReportResponseDTO userReport = reportService.createReport(reporterUser.getId(), CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.POST)
                .targetId(testPost.getId())
                .reason("SPAM")
                .details("Người dùng báo cáo trùng")
                .build());

        reportService.resolveReport(adminUser.getId(), userReport.getId(), ResolveReportRequestDTO.builder()
                .actionTaken(ReportActionTaken.REMOVE_CONTENT)
                .resolutionNotes("Gỡ bài spam")
                .build());

        reportRepo.getEntityManager().clear();
        Report aiAfter = reportRepo.findById(aiReportId);
        assertEquals(ReportStatus.RESOLVED, aiAfter.getStatus(), "Đơn AI trùng target phải tự động chuyển RESOLVED");
        assertEquals(ReportActionTaken.REMOVE_CONTENT, aiAfter.getActionTaken());
        assertEquals(adminUser.getId(), aiAfter.getResolvedBy().getId());
    }

    @Test
    @DisplayName("Khóa tài khoản thất bại (khi target là ADMIN) phải ném lỗi và không đánh dấu báo cáo RESOLVED")
    public void testResolveReport_LockUser_FailsForAdminAndRollsBack() {
        ReportResponseDTO rep = reportService.createReport(reporterUser.getId(), CreateReportRequestDTO.builder()
                .targetType(ReportTargetType.USER)
                .targetId(adminUser.getId())
                .reason("Thử khóa Admin")
                .build());

        assertThrows(BadRequestException.class, () ->
                reportService.resolveReport(adminUser.getId(), rep.getId(), ResolveReportRequestDTO.builder()
                        .actionTaken(ReportActionTaken.LOCK_USER)
                        .resolutionNotes("Cố tình khóa")
                        .build()));

        reportRepo.getEntityManager().clear();
        Report stillPending = reportRepo.findById(rep.getId());
        assertEquals(ReportStatus.PENDING, stillPending.getStatus(), "Báo cáo phải giữ nguyên PENDING khi LOCK_USER thất bại");
    }

    @Test
    @DisplayName("LockedUserFilter chặn ngay JWT còn hạn khi tài khoản bị khóa và endpoint Admin lọc source/keyword hoạt động")
    public void testLockedUserFilterAndAdminReportEndpoints() {
        String userToken = jwtService.generateJwt(badUser.getId(), SystemRole.USER.name());
        String adminToken = jwtService.generateJwt(adminUser.getId(), SystemRole.ADMIN.name());

        // Khi chưa bị khóa: gọi API thành công 200
        RestAssured.given()
                .header("Authorization", "Bearer " + userToken)
                .when()
                .get("/api/v1/posts/feed")
                .then()
                .statusCode(200);

        // Khóa tài khoản badUser -> gọi API với JWT cũ phải bị chặn ngay 403
        userService.lockUser(badUser.getId(), new LockUserRequestDTO("TEMPORARY", 7, "Vi phạm quy định"), adminUser.getId());
        RestAssured.given()
                .header("Authorization", "Bearer " + userToken)
                .when()
                .get("/api/v1/posts/feed")
                .then()
                .statusCode(403)
                .body("message", containsString("bị khóa"));

        // Mở khóa lại -> gọi API thành công 200
        userService.unlockUser(badUser.getId());
        RestAssured.given()
                .header("Authorization", "Bearer " + userToken)
                .when()
                .get("/api/v1/posts/feed")
                .then()
                .statusCode(200);

        // Kiểm tra endpoint /api/admin/reports với source=AI_MODERATION & keyword và /api/admin/dashboard
        UUID aiReportId = QuarkusTransaction.requiringNew().call(() -> {
            Report aiReport = Report.builder()
                    .reporter(null)
                    .source(ReportSource.AI_MODERATION)
                    .aiConfidence(0.95)
                    .targetType(ReportTargetType.POST)
                    .targetId(testPost.getId())
                    .reason("SCAM")
                    .details("Lừa đảo tuyển dụng")
                    .status(ReportStatus.PENDING)
                    .build();
            reportRepo.persist(aiReport);
            extraReportIds.add(aiReport.getId());
            return aiReport.getId();
        });

        RestAssured.given()
                .header("Authorization", "Bearer " + adminToken)
                .queryParam("status", "PENDING")
                .queryParam("source", "AI_MODERATION")
                .queryParam("keyword", "tuyển dụng")
                .when()
                .get("/api/admin/reports")
                .then()
                .statusCode(200)
                .body("data.items.id", hasItem(aiReportId.toString()))
                .body("data.items.source", hasItem("AI_MODERATION"));

        RestAssured.given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .get("/api/admin/dashboard")
                .then()
                .statusCode(200)
                .body("recentReports.id", hasItem(aiReportId.toString()))
                .body("recentReports.reporterName", hasItem("AI Kiểm duyệt"));
    }
}
