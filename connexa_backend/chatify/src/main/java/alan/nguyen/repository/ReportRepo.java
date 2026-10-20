package alan.nguyen.repository;

import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.entity.Report;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class ReportRepo implements PanacheRepositoryBase<Report, UUID> {

    public boolean hasPendingReport(UUID reporterId, ReportTargetType targetType, UUID targetId) {
        return count("reporter.id = ?1 and targetType = ?2 and targetId = ?3 and status = ?4",
                reporterId, targetType, targetId, ReportStatus.PENDING) > 0;
    }

    public PanacheQuery<Report> findFiltered(ReportStatus status, ReportTargetType targetType, Page page) {
        StringBuilder query = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        if (status != null) {
            query.append(" and status = :status");
            params.put("status", status);
        }
        if (targetType != null) {
            query.append(" and targetType = :targetType");
            params.put("targetType", targetType);
        }
        query.append(" order by createdAt desc");

        return find(query.toString(), params).page(page);
    }
}
