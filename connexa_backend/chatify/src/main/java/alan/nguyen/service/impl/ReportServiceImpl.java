package alan.nguyen.service.impl;

import alan.nguyen.common.NortificationType;
import alan.nguyen.common.ReportActionTaken;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.AdminReportResponseDTO;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.admin.LockUserRequestDTO;
import alan.nguyen.dto.admin.ResolveReportRequestDTO;
import alan.nguyen.dto.report.CreateReportRequestDTO;
import alan.nguyen.dto.report.ReportResponseDTO;
import alan.nguyen.entity.*;
import alan.nguyen.repository.*;
import alan.nguyen.service.PostService;
import alan.nguyen.service.ReportService;
import alan.nguyen.service.UserService;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ReportServiceImpl implements ReportService {

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
    PostService postService;

    @Inject
    UserService userService;

    @Override
    @Transactional
    public ReportResponseDTO createReport(UUID reporterId, CreateReportRequestDTO dto) {
        User reporter = userRepo.findByIdOptional(reporterId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người gửi báo cáo"));

        // Chống spam: Không được gửi liên tiếp 2 báo cáo cho cùng 1 đối tượng khi đơn cũ còn PENDING
        if (reportRepo.hasPendingReport(reporterId, dto.getTargetType(), dto.getTargetId())) {
            throw new BadRequestException("Bạn đã có một báo cáo đang chờ xử lý cho đối tượng này. Vui lòng chờ quản trị viên xem xét.");
        }

        // Kiểm tra đối tượng bị báo cáo có tồn tại và hợp lệ không
        validateTargetExistence(reporterId, dto.getTargetType(), dto.getTargetId());

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(dto.getTargetType())
                .targetId(dto.getTargetId())
                .reason(dto.getReason())
                .details(dto.getDetails())
                .status(ReportStatus.PENDING)
                .build();

        reportRepo.persist(report);

        return ReportResponseDTO.fromEntity(report);
    }

    private void validateTargetExistence(UUID reporterId, ReportTargetType targetType, UUID targetId) {
        if (targetType == ReportTargetType.POST) {
            postRepo.findActiveById(targetId)
                    .orElseThrow(() -> new NotFoundException("Bài viết bị báo cáo không tồn tại hoặc đã bị xóa"));
        } else if (targetType == ReportTargetType.COMMENT) {
            postCommentRepo.findActiveById(targetId)
                    .orElseThrow(() -> new NotFoundException("Bình luận bị báo cáo không tồn tại hoặc đã bị xóa"));
        } else if (targetType == ReportTargetType.USER) {
            if (reporterId.equals(targetId)) {
                throw new BadRequestException("Bạn không thể tự báo cáo chính mình");
            }
            userRepo.findByIdOptional(targetId)
                    .orElseThrow(() -> new NotFoundException("Người dùng bị báo cáo không tồn tại"));
        }
    }

    @Override
    public PageResponseDTO<AdminReportResponseDTO> getAdminReports(ReportStatus status, ReportTargetType targetType, int page, int size) {
        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 50);

        Page pageable = Page.of(pageIndex, pageSize);
        PanacheQuery<Report> query = reportRepo.findFiltered(status, targetType, pageable);

        List<AdminReportResponseDTO> items = query.list().stream()
                .map(this::mapToAdminDTO)
                .toList();

        return PageResponseDTO.of(items, query.page().index, query.page().size, query.count(), query.pageCount());
    }

    private AdminReportResponseDTO mapToAdminDTO(Report report) {
        AdminReportResponseDTO.UserSimpleDTO reporterDto = null;
        if (report.getReporter() != null) {
            reporterDto = AdminReportResponseDTO.UserSimpleDTO.builder()
                    .id(report.getReporter().getId())
                    .username(report.getReporter().getUsername())
                    .avatarUrl(report.getReporter().getAvatar_url())
                    .build();
        }

        AdminReportResponseDTO.UserSimpleDTO resolverDto = null;
        if (report.getResolvedBy() != null) {
            resolverDto = AdminReportResponseDTO.UserSimpleDTO.builder()
                    .id(report.getResolvedBy().getId())
                    .username(report.getResolvedBy().getUsername())
                    .avatarUrl(report.getResolvedBy().getAvatar_url())
                    .build();
        }

        AdminReportResponseDTO.TargetPreviewDTO previewDto = buildTargetPreview(report.getTargetType(), report.getTargetId());

        return AdminReportResponseDTO.builder()
                .id(report.getId())
                .reporter(reporterDto)
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .targetPreview(previewDto)
                .reason(report.getReason())
                .details(report.getDetails())
                .status(report.getStatus())
                .actionTaken(report.getActionTaken())
                .resolutionNotes(report.getResolutionNotes())
                .resolvedBy(resolverDto)
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }

    private AdminReportResponseDTO.TargetPreviewDTO buildTargetPreview(ReportTargetType targetType, UUID targetId) {
        if (targetType == ReportTargetType.POST) {
            Post post = postRepo.findById(targetId);
            if (post != null) {
                AdminReportResponseDTO.UserSimpleDTO authorDto = null;
                if (post.getAuthor() != null) {
                    authorDto = AdminReportResponseDTO.UserSimpleDTO.builder()
                            .id(post.getAuthor().getId())
                            .username(post.getAuthor().getUsername())
                            .avatarUrl(post.getAuthor().getAvatar_url())
                            .build();
                }
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content(post.getContent())
                        .author(authorDto)
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Bài viết đã bị gỡ hoặc không tồn tại]")
                        .build();
            }
        } else if (targetType == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(targetId);
            if (comment != null) {
                AdminReportResponseDTO.UserSimpleDTO authorDto = null;
                if (comment.getAuthor() != null) {
                    authorDto = AdminReportResponseDTO.UserSimpleDTO.builder()
                            .id(comment.getAuthor().getId())
                            .username(comment.getAuthor().getUsername())
                            .avatarUrl(comment.getAuthor().getAvatar_url())
                            .build();
                }
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content(comment.getContent())
                        .author(authorDto)
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Bình luận đã bị gỡ hoặc không tồn tại]")
                        .build();
            }
        } else if (targetType == ReportTargetType.USER) {
            User user = userRepo.findById(targetId);
            if (user != null) {
                AdminReportResponseDTO.UserSimpleDTO authorDto = AdminReportResponseDTO.UserSimpleDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .avatarUrl(user.getAvatar_url())
                        .build();
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Hồ sơ người dùng: @" + user.getUsername() + "]")
                        .author(authorDto)
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Người dùng không tồn tại]")
                        .build();
            }
        }
        return null;
    }

    @Override
    @Transactional
    public void resolveReport(UUID adminId, UUID reportId, ResolveReportRequestDTO dto) {
        Report report = reportRepo.findByIdOptional(reportId)
                .orElseThrow(() -> new NotFoundException("Báo cáo vi phạm không tồn tại"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new BadRequestException("Báo cáo này đã được xử lý trước đó");
        }

        User admin = userRepo.findByIdOptional(adminId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin quản trị viên"));

        ReportActionTaken action = dto.getActionTaken();

        if (action == ReportActionTaken.REMOVE_CONTENT) {
            handleRemoveContent(adminId, report);
        } else if (action == ReportActionTaken.LOCK_USER) {
            handleLockUser(adminId, report, dto.getResolutionNotes());
        } else if (action == ReportActionTaken.WARN_USER) {
            handleWarnUser(adminId, report);
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setActionTaken(action);
        report.setResolutionNotes(dto.getResolutionNotes());
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());

        reportRepo.persist(report);
    }

    private void handleRemoveContent(UUID adminId, Report report) {
        if (report.getTargetType() == ReportTargetType.POST) {
            // Xóa mềm bài viết
            try {
                postService.deletePost(adminId, report.getTargetId());
            } catch (Exception e) {
                // Nếu bài viết đã bị xóa trước đó thì bỏ qua
            }
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            // Xóa mềm bình luận
            PostComment comment = postCommentRepo.findById(report.getTargetId());
            if (comment != null) {
                comment.setDeleted(true);
                comment.setContent("Bình luận đã bị gỡ do vi phạm tiêu chuẩn cộng đồng.");
                postCommentRepo.persist(comment);
            }
        }
    }

    private void handleLockUser(UUID adminId, Report report, String reason) {
        UUID targetUserId = null;
        if (report.getTargetType() == ReportTargetType.USER) {
            targetUserId = report.getTargetId();
        } else if (report.getTargetType() == ReportTargetType.POST) {
            Post post = postRepo.findById(report.getTargetId());
            if (post != null && post.getAuthor() != null) {
                targetUserId = post.getAuthor().getId();
            }
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(report.getTargetId());
            if (comment != null && comment.getAuthor() != null) {
                targetUserId = comment.getAuthor().getId();
            }
        }

        if (targetUserId != null) {
            LockUserRequestDTO lockDto = new LockUserRequestDTO(
                    "TEMPORARY",
                    7,
                    reason != null && !reason.isBlank() ? reason : "Vi phạm quy chuẩn cộng đồng theo đơn báo cáo"
            );
            userService.lockUser(targetUserId, lockDto, adminId);
        }
    }

    private void handleWarnUser(UUID adminId, Report report) {
        UUID targetUserId = null;
        if (report.getTargetType() == ReportTargetType.USER) {
            targetUserId = report.getTargetId();
        } else if (report.getTargetType() == ReportTargetType.POST) {
            Post post = postRepo.findById(report.getTargetId());
            if (post != null && post.getAuthor() != null) {
                targetUserId = post.getAuthor().getId();
            }
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(report.getTargetId());
            if (comment != null && comment.getAuthor() != null) {
                targetUserId = comment.getAuthor().getId();
            }
        }

        if (targetUserId != null) {
            Notification notif = new Notification();
            notif.setReceiver_id(targetUserId);
            notif.setActor_id(adminId);
            notif.setType(NortificationType.SYSTEM_WARNING);
            if (report.getTargetType() == ReportTargetType.POST) {
                notif.setPost_id(report.getTargetId());
            } else if (report.getTargetType() == ReportTargetType.COMMENT) {
                notif.setComment_id(report.getTargetId());
            }
            notif.set_read(false);
            notif.setCreated_at(LocalDateTime.now());
            notificationRepo.persist(notif);
        }
    }

    @Override
    @Transactional
    public void dismissReport(UUID adminId, UUID reportId, DismissReportRequestDTO dto) {
        Report report = reportRepo.findByIdOptional(reportId)
                .orElseThrow(() -> new NotFoundException("Báo cáo vi phạm không tồn tại"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new BadRequestException("Báo cáo này đã được xử lý trước đó");
        }

        User admin = userRepo.findByIdOptional(adminId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin quản trị viên"));

        report.setStatus(ReportStatus.DISMISSED);
        report.setActionTaken(ReportActionTaken.DISMISSED);
        report.setResolutionNotes(dto != null ? dto.getResolutionNotes() : null);
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());

        reportRepo.persist(report);
    }
}
