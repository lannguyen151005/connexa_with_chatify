package alan.nguyen;

import alan.nguyen.common.NortificationType;
import alan.nguyen.common.ReportActionTaken;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.AdminReportResponseDTO;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.admin.ResolveReportRequestDTO;
import alan.nguyen.dto.report.CreateReportRequestDTO;
import alan.nguyen.dto.report.ReportResponseDTO;
import alan.nguyen.entity.Notification;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.PostComment;
import alan.nguyen.entity.Report;
import alan.nguyen.entity.User;
import alan.nguyen.repository.*;
import alan.nguyen.service.ReportService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

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

    private User reporterUser;
    private User badUser;
    private User adminUser;
    private Post testPost;
    private PostComment testComment;

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
                .isDeleted(false)
                .build();
        postRepo.persist(testPost);

        testComment = PostComment.builder()
                .post(testPost)
                .author(badUser)
                .content("Bình luận xúc phạm người khác")
                .build();
        postCommentRepo.persist(testComment);
    }

    @AfterEach
    @Transactional
    public void cleanup() {
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

        // Kiểm tra đã tạo thông báo cảnh cáo cho tác giả bài viết
        long countWarning = notificationRepo.count("receiver_id = ?1 and type = ?2",
                badUser.getId(), NortificationType.SYSTEM_WARNING);
        assertTrue(countWarning > 0, "Phải có thông báo SYSTEM_WARNING gửi về cho người dùng bị cảnh cáo");
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
}
