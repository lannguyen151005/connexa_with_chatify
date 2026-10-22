package alan.nguyen.controller;

import alan.nguyen.common.ApiResponse;
import alan.nguyen.dto.chatbot.ChatbotAskRequestDTO;
import alan.nguyen.dto.chatbot.ChatbotAskResponseDTO;
import alan.nguyen.entity.User;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.chatbot.ChatbotConfigService;
import alan.nguyen.service.chatbot.ChatbotService;
import io.quarkus.security.identity.SecurityIdentity;
import io.vertx.core.http.HttpServerRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Controller xu ly hoi dap cho Tro ly ao Charles (Connexa AI).
 * Ho tro ca nguoi dung da dang nhap va khach vang lai (@PermitAll).
 */
@Path("/api/v1/chatbot")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class ChatbotController {

    private static final Logger LOG = Logger.getLogger(ChatbotController.class);

    private static final int MAX_REQUESTS_PER_MINUTE_AUTHENTICATED = 15;
    private static final int MAX_REQUESTS_PER_MINUTE_ANONYMOUS = 6;
    private static final long WINDOW_MILLIS = 60_000L;

    // Rate limiting in-memory theo key (user:<userId> hoac ip:<clientIp>)
    private final ConcurrentHashMap<String, Deque<Long>> rateLimitMap = new ConcurrentHashMap<>();

    @Inject
    ChatbotService chatbotService;

    @Inject
    ChatbotConfigService chatbotConfigService;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    JsonWebToken jwt;

    @Inject
    UserRepo userRepo;

    @Context
    HttpServerRequest httpRequest;

    /**
     * Lay trang thai hien tai cua Tro ly Charles
     */
    @GET
    @Path("/status")
    public Response getStatus() {
        return Response.ok(ApiResponse.success("Trạng thái Trợ lý Charles", Map.of(
                "active", chatbotConfigService.isBotActive(),
                "botName", "Charles AI"
        ))).build();
    }

    /**
     * Gui cau hoi ve Connexa & Chatify cho Tro ly Charles
     */
    @POST
    @Path("/ask")
    public Response ask(@Valid @NotNull ChatbotAskRequestDTO request) {
        // 1. Kiem tra trang thai hoat dong cua Bot
        if (!chatbotConfigService.isBotActive()) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(ApiResponse.error("Trợ lý Charles hiện đang tạm tắt để bảo trì. Vui lòng quay lại sau!"))
                    .build();
        }

        // 2. Xac thuc danh tinh nguoi dung tu SecurityIdentity / JWT (Khong tin tuong Client tu khai bao)
        UUID[] userIdHolder = new UUID[1];
        String userDisplayName = resolveUserDisplayName(userIdHolder);
        boolean isAuthenticated = (userIdHolder[0] != null);

        // 3. Rate limiting theo IP (khach) hoac User ID (da dang nhap)
        String clientIp = extractClientIp(httpRequest);
        String rateLimitKey = isAuthenticated ? ("user:" + userIdHolder[0]) : ("ip:" + clientIp);

        if (isRateLimited(rateLimitKey, isAuthenticated)) {
            LOG.warnf("Rate limit vuot muc cho [%s] tu IP [%s]", rateLimitKey, clientIp);
            return Response.status(429)
                    .entity(ApiResponse.error("Bạn đã gửi quá nhiều câu hỏi trong thời gian ngắn. Vui lòng chờ 1 phút trước khi tiếp tục!"))
                    .build();
        }

        // 4. Xu ly cau hoi qua ChatbotService
        try {
            ChatbotAskResponseDTO responseDTO = chatbotService.askAboutConnexa(request, userDisplayName);
            return Response.ok(ApiResponse.success("Phản hồi từ Trợ lý Charles thành công", responseDTO)).build();
        } catch (Exception ex) {
            LOG.error("Lỗi khi xử lý câu hỏi với Trợ lý Charles", ex);
            String exMsg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
            Throwable rootCause = getRootCause(ex);
            String rootMsg = rootCause != null && rootCause.getMessage() != null ? rootCause.getMessage().toLowerCase() : "";

            if (exMsg.contains("timeout") || rootMsg.contains("timeout")
                    || exMsg.contains("timed out") || rootMsg.contains("timed out")) {
                return Response.status(Response.Status.GATEWAY_TIMEOUT)
                        .entity(ApiResponse.error("Yêu cầu tới Trợ lý Charles đã quá thời gian chờ (Timeout). Vui lòng thử lại sau."))
                        .build();
            }

            if (exMsg.contains("rate limit") || rootMsg.contains("rate limit")
                    || exMsg.contains("429") || rootMsg.contains("429")) {
                return Response.status(429)
                        .entity(ApiResponse.error("Hệ thống AI đạt hạn mức truy vấn đồng thời. Vui lòng thử lại sau một lát."))
                        .build();
            }

            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(ApiResponse.error("Trợ lý Charles hiện đang bận hoặc gặp sự cố kết nối AI. Vui lòng thử lại sau ít phút."))
                    .build();
        }
    }

    /**
     * Kiem tra rate limit bang Sliding Window in-memory
     */
    private boolean isRateLimited(String rateLimitKey, boolean isAuthenticated) {
        cleanupOldEntries();
        long now = System.currentTimeMillis();
        int maxAllowed = isAuthenticated ? MAX_REQUESTS_PER_MINUTE_AUTHENTICATED : MAX_REQUESTS_PER_MINUTE_ANONYMOUS;

        Deque<Long> timestamps = rateLimitMap.computeIfAbsent(rateLimitKey, k -> new ConcurrentLinkedDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MILLIS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxAllowed) {
                return true;
            }
            timestamps.addLast(now);
            return false;
        }
    }

    /**
     * Don dep cac key rate limit qua cu de tiet kiem bo nho
     */
    private void cleanupOldEntries() {
        if (rateLimitMap.size() > 500) {
            long now = System.currentTimeMillis();
            rateLimitMap.entrySet().removeIf(entry -> {
                Deque<Long> queue = entry.getValue();
                synchronized (queue) {
                    while (!queue.isEmpty() && now - queue.peekFirst() > WINDOW_MILLIS) {
                        queue.pollFirst();
                    }
                    return queue.isEmpty();
                }
            });
        }
    }

    /**
     * Trich xuat ten hien thi cua nguoi dung tu JWT/SecurityIdentity
     */
    private String resolveUserDisplayName(UUID[] outUserId) {
        if (securityIdentity != null && !securityIdentity.isAnonymous()) {
            try {
                if (jwt != null && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
                    UUID userId = UUID.fromString(jwt.getSubject());
                    if (outUserId != null && outUserId.length > 0) {
                        outUserId[0] = userId;
                    }
                    User user = userRepo.findById(userId);
                    if (user != null && user.getUsername() != null && !user.getUsername().isBlank()) {
                        return user.getUsername();
                    }
                }
            } catch (Exception ex) {
                LOG.warn("Không thể trích xuất thông tin người dùng từ JWT: " + ex.getMessage());
            }

            if (securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
                return securityIdentity.getPrincipal().getName();
            }
        }
        return null; // Khach vang lai
    }

    /**
     * Lay dia chi IP cua Client tu Header proxy hoac Vert.x Request
     */
    private String extractClientIp(HttpServerRequest request) {
        if (request == null) {
            return "unknown-ip";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        if (request.remoteAddress() != null) {
            return request.remoteAddress().host();
        }
        return "unknown-ip";
    }

    /**
     * Tim nguyen nhan goc re cua Exception
     */
    private Throwable getRootCause(Throwable throwable) {
        Throwable cause = throwable;
        while (cause != null && cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause;
    }
}
