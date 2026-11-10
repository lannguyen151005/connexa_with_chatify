package alan.nguyen.service;

import alan.nguyen.common.ReportSource;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.AdminDashboardRecentReportDTO;
import alan.nguyen.dto.admin.AdminReportResponseDTO;
import alan.nguyen.dto.admin.DismissReportRequestDTO;
import alan.nguyen.dto.admin.ResolveReportRequestDTO;
import alan.nguyen.dto.report.CreateReportRequestDTO;
import alan.nguyen.dto.report.ReportResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ReportService {

    /**
     * Người dùng gửi báo cáo vi phạm
     */
    ReportResponseDTO createReport(UUID reporterId, CreateReportRequestDTO dto);

    /**
     * Quản trị viên lấy danh sách báo cáo có lọc và phân trang
     */
    PageResponseDTO<AdminReportResponseDTO> getAdminReports(ReportStatus status, ReportTargetType targetType, int page, int size);

    /**
     * Quản trị viên lấy danh sách báo cáo có lọc theo trạng thái, loại đối tượng, nguồn phát hiện và từ khóa
     */
    PageResponseDTO<AdminReportResponseDTO> getAdminReports(
            ReportStatus status,
            ReportTargetType targetType,
            ReportSource source,
            String keyword,
            int page,
            int size
    );

    /**
     * Lấy danh sách báo cáo đang chờ xử lý mới nhất cho Dashboard Admin
     */
    List<AdminDashboardRecentReportDTO> getRecentPendingReports(int limit);

    /**
     * Quản trị viên xử lý giải quyết báo cáo
     */
    void resolveReport(UUID adminId, UUID reportId, ResolveReportRequestDTO dto);

    /**
     * Quản trị viên bác bỏ báo cáo
     */
    void dismissReport(UUID adminId, UUID reportId, DismissReportRequestDTO dto);
}
