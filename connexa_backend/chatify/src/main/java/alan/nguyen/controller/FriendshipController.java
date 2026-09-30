package alan.nguyen.controller;

import alan.nguyen.dto.FriendshipRequestDTO;
import alan.nguyen.dto.FriendshipResponseDTO;
import alan.nguyen.service.FriendshipService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

// Chỉ cần import SecurityRequirement
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import java.util.UUID;

@Path("/api/v1/friend-requests")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated

// Liên kết trực tiếp tới SecurityScheme đã có sẵn của hệ thống
@SecurityRequirement(name = "SecurityScheme")
public class FriendshipController {

    @Inject
    FriendshipService friendshipService;

    @Inject
    JsonWebToken jwt;

    private UUID getCurrentUserId() {
        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new NotAuthorizedException("Token không hợp lệ hoặc thiếu dữ liệu Subject");
        }
        return UUID.fromString(subject);
    }

    /**
     * Gửi lời mời kết bạn
     * <p>
     * POST /api/friend-requests
     */
    @POST
    public Response sendRequest(
            FriendshipRequestDTO dto
    ) {

        // THAY THẾ LỆNH CŨ BẰNG HÀM VỪA TẠO
        UUID currentUserId = getCurrentUserId();

        FriendshipResponseDTO request =
                friendshipService.sendRequest(
                        currentUserId,
                        dto
                );

        return Response
                .status(Response.Status.CREATED)
                .entity(request)
                .build();
    }

    /**
     * Chấp nhận lời mời kết bạn
     * <p>
     * Endpoint: PUT /api/v1/friend-requests/{id}/accept
     * Quyền: Chỉ người nhận (Receiver) mới có thể chấp nhận
     */
    @PUT
    @Path("/{id}/accept")
    public Response acceptRequest(
            @PathParam("id") UUID requestId
    ) {
        // 1. Lấy ID của người dùng đang đăng nhập (Người nhận - Token B)
        UUID currentUserId = getCurrentUserId();

        // 2. Gọi Service xử lý logic đổi trạng thái thành ACCEPTED
        FriendshipResponseDTO request = friendshipService.acceptRequest(
                currentUserId,
                requestId
        );

        // 3. Trả về HTTP 200 OK cùng dữ liệu đã cập nhật
        return Response.ok(request).build();
    }

    /**
     * Từ chối lời mời kết bạn
     * <p>
     * Endpoint: PUT /api/v1/friend-requests/{id}/reject
     * Quyền: Chỉ người nhận (Receiver) mới có thể từ chối
     */
    @PUT
    @Path("/{id}/reject")
    public Response rejectRequest(
            @PathParam("id") UUID requestId
    ) {
        // 1. Lấy ID của người dùng đang đăng nhập (Người nhận - Token B)
        UUID currentUserId = getCurrentUserId();

        // 2. Gọi Service xử lý logic đổi trạng thái thành REJECTED
        FriendshipResponseDTO request = friendshipService.rejectRequest(
                currentUserId,
                requestId
        );

        // 3. Trả về HTTP 200 OK cùng dữ liệu đã cập nhật
        return Response.ok(request).build();
    }
}