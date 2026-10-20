package alan.nguyen.controller;

import alan.nguyen.common.ApiResponse;
import alan.nguyen.dto.report.CreateReportRequestDTO;
import alan.nguyen.dto.report.ReportResponseDTO;
import alan.nguyen.service.ReportService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

@Path("/api/v1/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class ReportController {

    @Inject
    ReportService reportService;

    @Inject
    JsonWebToken jwt;

    /**
     * Người dùng gửi báo cáo vi phạm
     */
    @POST
    public Response createReport(@Valid @NotNull CreateReportRequestDTO dto) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        ReportResponseDTO result = reportService.createReport(currentUserId, dto);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Gửi báo cáo thành công", result))
                .build();
    }
}
