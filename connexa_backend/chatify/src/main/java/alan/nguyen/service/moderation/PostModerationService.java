package alan.nguyen.service.moderation;

import alan.nguyen.common.PostPrivacy;
import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.moderation.PostModerationResult;
import alan.nguyen.entity.Post;
import alan.nguyen.entity.Report;
import alan.nguyen.repository.PostRepo;
import alan.nguyen.repository.ReportRepo;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.inject.Inject;
import jakarta.persistence.PersistenceException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Objects;
import java.util.Optional;

/**
 * Dịch vụ hậu kiểm bài đăng bằng AI chạy bất đồng bộ sau khi transaction đăng/sửa bài commit thành công.
 */
@ApplicationScoped
public class PostModerationService {

    private static final Logger LOG = Logger.getLogger(PostModerationService.class);
    private static final String CLEAN_AFTER_EDIT_NOTE =
            "[Cập nhật sau chỉnh sửa]: Nội dung mới không còn vượt ngưỡng vi phạm của AI, giữ đơn để Admin kiểm tra.";

    @ConfigProperty(name = "app.moderation.ai.enabled", defaultValue = "true")
    boolean aiModerationEnabled;

    @ConfigProperty(name = "app.moderation.ai.confidence-threshold", defaultValue = "0.70")
    double confidenceThreshold;

    @Inject
    PostModerationClassifier classifier;

    @Inject
    PostRepo postRepo;

    @Inject
    ReportRepo reportRepo;

    void onPostSubmitted(@Observes(during = TransactionPhase.AFTER_SUCCESS) PostSubmittedForModerationEvent event) {
        if (!isEligibleForModeration(event)) {
            return;
        }
        Infrastructure.getDefaultWorkerPool().execute(() -> moderatePostSafe(event));
    }

    public boolean isEligibleForModeration(PostSubmittedForModerationEvent event) {
        if (!aiModerationEnabled || event == null || event.postId() == null) {
            return false;
        }
        if (event.authorRole() == SystemRole.ADMIN) {
            return false;
        }
        if (event.privacy() == PostPrivacy.PRIVATE) {
            return false;
        }
        String content = event.content();
        if (content == null || content.isBlank()) {
            return false;
        }
        // Bỏ qua bài chỉ chứa ký tự đặc biệt/emoji không có chữ hoặc số để tránh tốn quota vô ích
        return content.codePoints().anyMatch(Character::isLetterOrDigit);
    }

    @ActivateRequestContext
    public void moderatePostSafe(PostSubmittedForModerationEvent event) {
        if (!isEligibleForModeration(event)) {
            return;
        }

        try {
            PostModerationResult result = classifier.classify(event.content(), event.hashtags());
            persistModerationOutcome(event, result);
        } catch (Exception e) {
            LOG.warnf(e, "AI moderation failed safely for postId=%s", event.postId());
        }
    }

    void persistModerationOutcome(PostSubmittedForModerationEvent event, PostModerationResult result) {
        if (result == null) {
            return;
        }

        try {
            QuarkusTransaction.requiringNew().run(() -> {
                Post post = postRepo.findActiveById(event.postId()).orElse(null);
                if (post == null || post.getPrivacy() == PostPrivacy.PRIVATE) {
                    return;
                }
                // Nếu bài viết đã bị sửa tiếp trong lúc AI đang phân tích, nhường cho sự kiện mới hơn xử lý
                if (!Objects.equals(post.getContent(), event.content())) {
                    return;
                }

                Optional<Report> existingPendingOpt =
                        reportRepo.findPendingAiReport(ReportTargetType.POST, event.postId());

                boolean shouldFlag = result.flagged() && result.confidence() >= confidenceThreshold;
                if (shouldFlag) {
                    String reasonCategory = (result.category() == null || result.category().isBlank())
                            ? "OTHER"
                            : result.category();
                    String detailsText = result.reason();

                    if (existingPendingOpt.isPresent()) {
                        Report existing = existingPendingOpt.get();
                        existing.setReason(reasonCategory);
                        existing.setDetails(detailsText);
                        existing.setAiConfidence(result.confidence());
                        reportRepo.persist(existing);
                    } else {
                        Report aiReport = Report.builder()
                                .reporter(null)
                                .source(ReportSource.AI_MODERATION)
                                .aiConfidence(result.confidence())
                                .targetType(ReportTargetType.POST)
                                .targetId(event.postId())
                                .reason(reasonCategory)
                                .details(detailsText)
                                .status(ReportStatus.PENDING)
                                .build();
                        reportRepo.persist(aiReport);
                    }
                } else if (existingPendingOpt.isPresent() && event.isUpdate()) {
                    // Giữ nguyên đơn PENDING cũ để Admin tự xem xét, bổ sung ghi chú đã quét lại sau khi sửa
                    Report existing = existingPendingOpt.get();
                    String currentDetails = existing.getDetails() != null ? existing.getDetails() : "";
                    if (!currentDetails.contains(CLEAN_AFTER_EDIT_NOTE)) {
                        String updatedDetails = currentDetails.isBlank()
                                ? CLEAN_AFTER_EDIT_NOTE
                                : currentDetails + "\n" + CLEAN_AFTER_EDIT_NOTE;
                        existing.setDetails(updatedDetails);
                        reportRepo.persist(existing);
                    }
                }
            });
        } catch (PersistenceException e) {
            LOG.warnf(e, "Concurrent AI moderation report write skipped for postId=%s", event.postId());
        }
    }
}

