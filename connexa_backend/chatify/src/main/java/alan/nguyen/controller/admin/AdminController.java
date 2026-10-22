package alan.nguyen.controller.admin;

import alan.nguyen.common.ApiResponse;
import alan.nguyen.common.ReportStatus;
import alan.nguyen.common.ReportTargetType;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.admin.*;
import alan.nguyen.dto.connexa.post.PostResponseDTO;
import alan.nguyen.repository.PostCommentRepo;
import alan.nguyen.repository.PostReactionRepo;
import alan.nguyen.repository.PostRepo;
import alan.nguyen.repository.ReportRepo;
import alan.nguyen.service.ConversationService;
import alan.nguyen.service.MessageService;
import alan.nguyen.service.PostService;
import alan.nguyen.service.ReportService;
import alan.nguyen.service.UserService;
import alan.nguyen.service.chatbot.ChatbotConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class AdminController {

    @Inject
    UserService userService;

    @Inject
    MessageService messageService;

    @Inject
    ConversationService conversationService;

    @Inject
    PostService postService;

    @Inject
    ReportService reportService;

    @Inject
    PostRepo postRepo;

    @Inject
    PostCommentRepo postCommentRepo;

    @Inject
    PostReactionRepo postReactionRepo;

    @Inject
    ReportRepo reportRepo;

    @Inject
    JsonWebToken jwt;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    ChatbotConfigService chatbotConfigService;

    // Phục vụ backward-compatibility cho ChatWebSocket
    private static ChatbotConfigService staticConfigService;

    @Inject
    void initStatic(ChatbotConfigService configService) {
        staticConfigService = configService;
    }

    // Biến tạm lưu trạng thái Bot (Trong thực tế nên lưu vào Database bảng `SystemConfig`)
    private static boolean isCharlesEnabled = true;
    private static long charlesTokensUsed = 15420; // Giả lập số lượng token đã dùng

    public static boolean isBotActive() {
        return staticConfigService != null ? staticConfigService.isBotActive() : true;
    }

    @GET
    @Path("/dashboard")
    public Response getDashboardData() {
        ObjectNode response = objectMapper.createObjectNode();

        response.put("totalUsers", userService.countAllUsers());
        response.put("totalRooms", conversationService.countAllConversations());
        response.put("totalMessagesToday", messageService.countMessagesToday());

        // Chỉ số Dashboard Mức 1: bài viết và tương tác chưa bị xóa mềm
        long totalPosts = postRepo.count("isDeleted = false");
        long activeComments = postCommentRepo.count("isDeleted = false and post.isDeleted = false");
        long activeReactions = postReactionRepo.count("post.isDeleted = false");
        long totalInteractions = activeComments + activeReactions;

        response.put("totalPosts", totalPosts);
        response.put("totalInteractions", totalInteractions);

        // Chỉ số Dashboard Mức 2: số đơn báo cáo đang chờ xử lý
        long pendingReports = reportRepo.count("status = ?1", ReportStatus.PENDING);
        response.put("pendingReports", pendingReports);

        response.put("isBotEnabled", chatbotConfigService.isBotActive());
        response.put("botTokensUsed", chatbotConfigService.getTokensUsed());

        // 2. Tạo dữ liệu giả lập cho biểu đồ 7 ngày (Bạn có thể Query DB group by Date thật sau)
        ArrayNode chartData = objectMapper.createArrayNode();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        // Tạo data lùi về 7 ngày trước
        int[] dummyMessages = {120, 250, 180, 400, 310, 560, (int) messageService.countMessagesToday()};
        for (int i = 6; i >= 0; i--) {
            ObjectNode dayNode = objectMapper.createObjectNode();
            dayNode.put("date", today.minusDays(i).format(formatter));
            dayNode.put("messages", dummyMessages[6 - i]);
            chartData.add(dayNode);
        }
        
        response.set("chartData", chartData);

        return Response.ok(response).build();
    }

    @POST
    @Path("/bot/toggle")
    public Response toggleBot(Map<String, Boolean> request) {
        if (request.containsKey("enabled")) {
            chatbotConfigService.setBotActive(request.get("enabled"));
            return Response.ok().build();
        }
        return Response.status(Response.Status.BAD_REQUEST).build();
    }

    @GET
    @Path("/users/list")
    public Response getManageUsers() {
        return Response.ok(userService.getAll()).build();
    }

    @DELETE
    @Path("/users/{id}")
    public Response deleteUserByAdmin(@PathParam("id") UUID userId) {
        userService.anonymizeUser(userId);
        return Response.ok("Đã xóa người dùng thành công").build();
    }

    @PATCH
    @Path("/users/{id}/lock")
    public Response lockUser(@PathParam("id") UUID userId, @Valid @NotNull LockUserRequestDTO dto) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        return userService.lockUser(userId, dto, adminId);
    }

    @PATCH
    @Path("/users/{id}/unlock")
    public Response unlockUser(@PathParam("id") UUID userId) {
        return userService.unlockUser(userId);
    }

    @GET
    @Path("/posts")
    public Response getAdminPosts(@QueryParam("page") @DefaultValue("0") int page,
                                  @QueryParam("size") @DefaultValue("10") int size) {
        PageResponseDTO<PostResponseDTO> result = postService.getAdminPosts(page, size);
        return Response.ok(ApiResponse.success("Lấy danh sách bài viết quản trị thành công", result)).build();
    }

    @PATCH
    @Path("/posts/{id}/pin")
    public Response pinPost(@PathParam("id") UUID postId, @Valid @NotNull PinPostRequestDTO dto) {
        PostResponseDTO post = postService.setPinPost(postId, dto.getIsPinned());
        String msg = Boolean.TRUE.equals(dto.getIsPinned()) ? "Ghim bài viết thành công" : "Bỏ ghim bài viết thành công";
        return Response.ok(ApiResponse.success(msg, post)).build();
    }

    @GET
    @Path("/reports")
    public Response getAdminReports(
            @QueryParam("status") ReportStatus status,
            @QueryParam("targetType") ReportTargetType targetType,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size
    ) {
        PageResponseDTO<AdminReportResponseDTO> result = reportService.getAdminReports(status, targetType, page, size);
        return Response.ok(ApiResponse.success("Lấy danh sách báo cáo vi phạm thành công", result)).build();
    }

    @POST
    @Path("/reports/{id}/resolve")
    public Response resolveReport(
            @PathParam("id") UUID reportId,
            @Valid @NotNull ResolveReportRequestDTO dto
    ) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        reportService.resolveReport(adminId, reportId, dto);
        return Response.ok(ApiResponse.success("Đã giải quyết báo cáo vi phạm thành công", null)).build();
    }

    @POST
    @Path("/reports/{id}/dismiss")
    public Response dismissReport(
            @PathParam("id") UUID reportId,
            DismissReportRequestDTO dto
    ) {
        UUID adminId = UUID.fromString(jwt.getSubject());
        reportService.dismissReport(adminId, reportId, dto);
        return Response.ok(ApiResponse.success("Đã bác bỏ báo cáo", null)).build();
    }

    @GET
    @Path("/rooms/list")
    public Response getManageRooms() {
        return Response.ok(conversationService.getAllRooms()).build();
    }

    @DELETE
    @Path("/rooms/{id}")
    public Response deleteRoomByAdmin(@PathParam("id") UUID conversation_id) {
        conversationService.deleteGroup(conversation_id);
        return Response.ok().build();
    }
}