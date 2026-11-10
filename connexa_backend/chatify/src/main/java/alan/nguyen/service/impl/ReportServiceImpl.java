package alan.nguyen.service.impl;

import alan.nguyen.common.NortificationType;
import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.ReportActionTaken;
import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.AdminDashboardRecentReportDTO;
import alan.nguyen.dto.admin.AdminReportResponseDTO;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.admin.LockUserRequestDTO;
import alan.nguyen.dto.admin.ResolveReportRequestDTO;
import alan.nguyen.dto.connexa.post.PostMediaDTO;
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
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class ReportServiceImpl implements ReportService {

    private static final String DEFAULT_WARNING_MESSAGE = "Nội dung của bạn đã vi phạm tiêu chuẩn cộng đồng. Vui lòng tuân thủ quy định khi tham gia Connexa.";

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
    FriendshipRepo friendshipRepo;

    @Inject
    PostService postService;

    @Inject
    UserService userService;

    @Override
    @Transactional
    public ReportResponseDTO createReport(UUID reporterId, CreateReportRequestDTO dto) {
        User reporter = userRepo.findByIdOptional(reporterId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người gửi báo cáo"));

        // Chống spam: Không được gửi liên tiếp 2 báo cáo cho cùng 1 đối tượng khi đơn
        // cũ còn PENDING
        if (reportRepo.hasPendingReport(reporterId, dto.getTargetType(), dto.getTargetId())) {
            throw new BadRequestException(
                    "Bạn đã có một báo cáo đang chờ xử lý cho đối tượng này. Vui lòng chờ quản trị viên xem xét.");
        }

        // Kiểm tra đối tượng bị báo cáo có tồn tại, không tự báo cáo và có quyền xem
        // hợp lệ không
        validateTargetExistence(reporterId, dto.getTargetType(), dto.getTargetId());

        Report report = Report.builder()
                .reporter(reporter)
                .source(ReportSource.USER)
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
            Post post = postRepo.findActiveById(targetId)
                    .orElseThrow(() -> new NotFoundException("Bài viết bị báo cáo không tồn tại hoặc đã bị xóa"));
            if (post.getAuthor() != null && reporterId.equals(post.getAuthor().getId())) {
                throw new BadRequestException("Bạn không thể tự báo cáo bài viết của chính mình");
            }
            if (!canViewPost(reporterId, post)) {
                throw new ForbiddenException("Bạn không có quyền báo cáo bài viết này");
            }
        } else if (targetType == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findActiveById(targetId)
                    .orElseThrow(() -> new NotFoundException("Bình luận bị báo cáo không tồn tại hoặc đã bị xóa"));
            if (comment.getAuthor() != null && reporterId.equals(comment.getAuthor().getId())) {
                throw new BadRequestException("Bạn không thể tự báo cáo bình luận của chính mình");
            }
            Post parentPost = comment.getPost();
            if (parentPost == null || parentPost.isDeleted()) {
                throw new NotFoundException("Bài viết chứa bình luận này không tồn tại hoặc đã bị xóa");
            }
            if (!canViewPost(reporterId, parentPost)) {
                throw new ForbiddenException("Bạn không có quyền báo cáo bình luận trong bài viết này");
            }
        } else if (targetType == ReportTargetType.USER) {
            if (reporterId.equals(targetId)) {
                throw new BadRequestException("Bạn không thể tự báo cáo chính mình");
            }
            userRepo.findByIdOptional(targetId)
                    .orElseThrow(() -> new NotFoundException("Người dùng bị báo cáo không tồn tại"));
        }
    }

    private boolean canViewPost(UUID viewerId, Post post) {
        if (post == null || post.getAuthor() == null) {
            return false;
        }
        UUID authorId = post.getAuthor().getId();
        if (viewerId.equals(authorId) || post.getPrivacy() == PostPrivacy.PUBLIC) {
            return true;
        }
        if (post.getPrivacy() == PostPrivacy.FRIENDS_ONLY) {
            return friendshipRepo.areFriends(viewerId, authorId);
        }
        return false;
    }

    @Override
    @Transactional
    public PageResponseDTO<AdminReportResponseDTO> getAdminReports(ReportStatus status, ReportTargetType targetType,
            int page, int size) {
        return getAdminReports(status, targetType, null, null, page, size);
    }

    @Override
    @Transactional
    public PageResponseDTO<AdminReportResponseDTO> getAdminReports(
            ReportStatus status,
            ReportTargetType targetType,
            ReportSource source,
            String keyword,
            int page,
            int size) {
        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 50);

        Page pageable = Page.of(pageIndex, pageSize);
        PanacheQuery<Report> query = reportRepo.findFiltered(status, targetType, source, keyword, pageable);

        List<AdminReportResponseDTO> items = query.list().stream()
                .map(this::mapToAdminDTO)
                .toList();

        return PageResponseDTO.of(items, query.page().index, query.page().size, query.count(), query.pageCount());
    }

    @Override
    @Transactional
    public List<AdminDashboardRecentReportDTO> getRecentPendingReports(int limit) {
        return reportRepo.findRecentPending(limit).stream()
                .map(report -> {
                    AdminReportResponseDTO.TargetPreviewDTO preview = buildTargetPreview(report.getTargetType(),
                            report.getTargetId());
                    boolean isAi = report.getSource() == ReportSource.AI_MODERATION || report.getReporter() == null;
                    return AdminDashboardRecentReportDTO.builder()
                            .id(report.getId())
                            .reporterName(isAi ? "AI Kiểm duyệt" : report.getReporter().getUsername())
                            .reporterAvatar(isAi ? null : report.getReporter().getAvatar_url())
                            .source(report.getSource() != null ? report.getSource() : ReportSource.USER)
                            .aiConfidence(report.getAiConfidence())
                            .targetType(report.getTargetType())
                            .targetSummary(preview != null ? preview.getContent() : "")
                            .reason(report.getReason())
                            .createdAt(report.getCreatedAt())
                            .status(report.getStatus())
                            .build();
                })
                .toList();
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

        AdminReportResponseDTO.TargetPreviewDTO previewDto = buildTargetPreview(report.getTargetType(),
                report.getTargetId());

        return AdminReportResponseDTO.builder()
                .id(report.getId())
                .reporter(reporterDto)
                .source(report.getSource() != null ? report.getSource() : ReportSource.USER)
                .aiConfidence(report.getAiConfidence())
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
                AdminReportResponseDTO.UserSimpleDTO authorDto = toUserSimpleDTO(post.getAuthor());
                List<PostMediaDTO> mediaList = post.getMediaList() == null
                        ? Collections.emptyList()
                        : post.getMediaList().stream()
                                .sorted(Comparator.comparingInt(PostMedia::getDisplay_order))
                                .map(PostMediaDTO::fromEntity)
                                .toList();
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content(post.getContent())
                        .author(authorDto)
                        .mediaList(mediaList)
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Bài viết đã bị gỡ hoặc không tồn tại]")
                        .build();
            }
        } else if (targetType == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(targetId);
            if (comment != null) {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content(comment.getContent())
                        .author(toUserSimpleDTO(comment.getAuthor()))
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Bình luận đã bị gỡ hoặc không tồn tại]")
                        .build();
            }
        } else if (targetType == ReportTargetType.USER) {
            User user = userRepo.findById(targetId);
            if (user != null) {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Hồ sơ người dùng: @" + user.getUsername() + "]")
                        .author(toUserSimpleDTO(user))
                        .build();
            } else {
                return AdminReportResponseDTO.TargetPreviewDTO.builder()
                        .content("[Người dùng không tồn tại]")
                        .build();
            }
        }
        return null;
    }

    private AdminReportResponseDTO.UserSimpleDTO toUserSimpleDTO(User user) {
        if (user == null) {
            return null;
        }
        return AdminReportResponseDTO.UserSimpleDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatar_url())
                .build();
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
        LocalDateTime now = LocalDateTime.now();

        if (action == ReportActionTaken.REMOVE_CONTENT) {
            handleRemoveContent(adminId, report, admin, now);
        } else if (action == ReportActionTaken.LOCK_USER) {
            handleLockUser(adminId, report, dto.getResolutionNotes());
        } else if (action == ReportActionTaken.WARN_USER) {
            handleWarnUser(adminId, report, dto.getResolutionNotes());
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setActionTaken(action);
        report.setResolutionNotes(dto.getResolutionNotes());
        report.setResolvedBy(admin);
        report.setResolvedAt(now);

        reportRepo.persist(report);
    }

    private void handleRemoveContent(UUID adminId, Report report, User admin, LocalDateTime resolvedAt) {
        if (report.getTargetType() == ReportTargetType.POST) {
            if (postRepo.findActiveById(report.getTargetId()).isPresent()) {
                postService.deletePost(adminId, report.getTargetId());
            }
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(report.getTargetId());
            if (comment != null && !comment.isDeleted()) {
                comment.setDeleted(true);
                comment.setContent("Bình luận đã bị gỡ do vi phạm tiêu chuẩn cộng đồng.");
                postCommentRepo.persist(comment);

                Post parentPost = comment.getPost();
                if (parentPost != null) {
                    parentPost.setComment_count(Math.max(0, parentPost.getComment_count() - 1));
                    postRepo.persist(parentPost);
                }
            }
        }

        // Tự động đóng các đơn PENDING khác trỏ cùng đối tượng sau khi nội dung đã bị
        // gỡ
        List<Report> duplicatePending = reportRepo.findOtherPendingReports(
                report.getId(), report.getTargetType(), report.getTargetId());
        for (Report other : duplicatePending) {
            other.setStatus(ReportStatus.RESOLVED);
            other.setActionTaken(ReportActionTaken.REMOVE_CONTENT);
            other.setResolutionNotes("Tự động đóng theo quyết định gỡ nội dung của báo cáo #" + report.getId());
            other.setResolvedBy(admin);
            other.setResolvedAt(resolvedAt);
            reportRepo.persist(other);
        }
    }

    private UUID resolveTargetAuthorId(Report report) {
        if (report.getTargetType() == ReportTargetType.USER) {
            return report.getTargetId();
        } else if (report.getTargetType() == ReportTargetType.POST) {
            Post post = postRepo.findById(report.getTargetId());
            return (post != null && post.getAuthor() != null) ? post.getAuthor().getId() : null;
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            PostComment comment = postCommentRepo.findById(report.getTargetId());
            return (comment != null && comment.getAuthor() != null) ? comment.getAuthor().getId() : null;
        }
        return null;
    }

    private void handleLockUser(UUID adminId, Report report, String reason) {
        UUID targetUserId = resolveTargetAuthorId(report);
        if (targetUserId == null) {
            throw new NotFoundException("Không tìm thấy tài khoản vi phạm để khóa");
        }

        LockUserRequestDTO lockDto = new LockUserRequestDTO(
                "TEMPORARY",
                7,
                reason != null && !reason.isBlank() ? reason : "Vi phạm quy chuẩn cộng đồng theo đơn báo cáo");
        Response lockResponse = userService.lockUser(targetUserId, lockDto, adminId);
        if (lockResponse.getStatus() >= 400) {
            String errMsg = "Không thể khóa tài khoản vi phạm";
            if (lockResponse.getEntity() instanceof Map<?, ?> body && body.get("message") != null) {
                errMsg = String.valueOf(body.get("message"));
            }
            if (lockResponse.getStatus() == Response.Status.NOT_FOUND.getStatusCode()) {
                throw new NotFoundException(errMsg);
            }
            throw new BadRequestException(errMsg);
        }
    }

    private void handleWarnUser(UUID adminId, Report report, String resolutionNotes) {
        UUID targetUserId = resolveTargetAuthorId(report);
        if (targetUserId == null) {
            throw new NotFoundException("Không tìm thấy tài khoản vi phạm để gửi cảnh cáo");
        }

        String warningMessage = (resolutionNotes != null && !resolutionNotes.isBlank())
                ? resolutionNotes.trim()
                : DEFAULT_WARNING_MESSAGE;

        Notification notif = new Notification();
        notif.setReceiver_id(targetUserId);
        notif.setActor_id(adminId);
        notif.setType(NortificationType.SYSTEM_WARNING);
        notif.setMessage(warningMessage);
        if (report.getTargetType() == ReportTargetType.POST) {
            notif.setPost_id(report.getTargetId());
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            notif.setComment_id(report.getTargetId());
        }
        notif.set_read(false);
        notif.setCreated_at(LocalDateTime.now());
        notificationRepo.persist(notif);
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
