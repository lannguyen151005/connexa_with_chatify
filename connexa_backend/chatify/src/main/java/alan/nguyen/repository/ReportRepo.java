package alan.nguyen.repository;

import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.entity.Report;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ReportRepo implements PanacheRepositoryBase<Report, UUID> {

    public boolean hasPendingReport(UUID reporterId, ReportTargetType targetType, UUID targetId) {
        return count("reporter.id = ?1 and targetType = ?2 and targetId = ?3 and status = ?4",
                reporterId, targetType, targetId, ReportStatus.PENDING) > 0;
    }

    public Optional<Report> findPendingAiReport(ReportTargetType targetType, UUID targetId) {
        return find("source = ?1 and targetType = ?2 and targetId = ?3 and status = ?4",
                ReportSource.AI_MODERATION, targetType, targetId, ReportStatus.PENDING)
                .firstResultOptional();
    }

    public List<Report> findOtherPendingReports(UUID excludeReportId, ReportTargetType targetType, UUID targetId) {
        return list("id <> ?1 and targetType = ?2 and targetId = ?3 and status = ?4",
                excludeReportId, targetType, targetId, ReportStatus.PENDING);
    }

    public List<Report> findRecentPending(int limit) {
        return find("status = ?1 order by createdAt desc, id desc", ReportStatus.PENDING)
                .page(Page.of(0, Math.max(1, limit)))
                .list();
    }

    public PanacheQuery<Report> findFiltered(ReportStatus status, ReportTargetType targetType, Page page) {
        return findFiltered(status, targetType, null, null, page);
    }

    public PanacheQuery<Report> findFiltered(
            ReportStatus status,
            ReportTargetType targetType,
            ReportSource source,
            String keyword,
            Page page
    ) {
        // Dùng left join với reporter để không làm rơi báo cáo AI (reporter = null) khi lọc theo keyword
        StringBuilder query = new StringBuilder("select r from Report r left join r.reporter rep where 1=1");
        Map<String, Object> params = new HashMap<>();

        if (status != null) {
            query.append(" and r.status = :status");
            params.put("status", status);
        }
        if (targetType != null) {
            query.append(" and r.targetType = :targetType");
            params.put("targetType", targetType);
        }
        if (source != null) {
            query.append(" and r.source = :source");
            params.put("source", source);
        }
        if (keyword != null && !keyword.isBlank()) {
            query.append("""
                     and (
                        lower(r.reason) like :keyword
                        or lower(coalesce(r.details, '')) like :keyword
                        or lower(coalesce(rep.username, '')) like :keyword
                        or lower(cast(r.id as string)) like :keyword
                    )
                    """);
            params.put("keyword", "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%");
        }
        query.append(" order by r.createdAt desc, r.id desc");

        return find(query.toString(), params).page(page);
    }
}
