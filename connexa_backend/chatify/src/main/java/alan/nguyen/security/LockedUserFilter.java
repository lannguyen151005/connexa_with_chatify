package alan.nguyen.security;

import alan.nguyen.service.UserService;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;

import java.util.Map;
import java.util.UUID;

/**
 * Chặn ngay lập tức các request REST từ tài khoản đang bị khóa (kể cả khi JWT cũ vẫn còn hạn).
 */
@ApplicationScoped
public class LockedUserFilter {

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    JsonWebToken jwt;

    @Inject
    UserService userService;

    @ServerRequestFilter(priority = Priorities.AUTHORIZATION + 10)
    public Uni<Response> filterLockedUser(ContainerRequestContext requestContext) {
        if (securityIdentity == null || securityIdentity.isAnonymous()) {
            return Uni.createFrom().nullItem();
        }

        String path = requestContext.getUriInfo().getPath();
        if (path != null && path.startsWith("/api/auth")) {
            return Uni.createFrom().nullItem();
        }

        String subject = (jwt != null && jwt.getSubject() != null)
                ? jwt.getSubject()
                : securityIdentity.getPrincipal().getName();
        if (subject == null || subject.isBlank()) {
            return Uni.createFrom().nullItem();
        }

        final UUID userId;
        try {
            userId = UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            return Uni.createFrom().nullItem();
        }

        return Uni.createFrom().item(() -> {
            String lockError = userService.evaluateLockStatusAndAutoUnlock(userId);
            if (lockError != null) {
                return Response.status(Response.Status.FORBIDDEN)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(Map.of("message", lockError))
                        .build();
            }
            return null;
        }).runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
    }
}
