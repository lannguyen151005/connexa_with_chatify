package alan.nguyen.service.auth;

import alan.nguyen.dto.chatify.user.LoginRequestDTO;
import alan.nguyen.entity.User;
import alan.nguyen.service.UserService;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.*;

@Singleton
public class JwtService {

    @Inject
    UserService userService;

    public String generateJwt(UUID id,String role){

        long duration = System.currentTimeMillis() + 3600;
        return Jwt.issuer("chatify-jwt")
                .subject(id.toString())
                .groups(role)
                .expiresAt(duration)
                .sign();
    }

    public Response getToken(LoginRequestDTO dto) {
        User existing_user = userService.login(dto.username, dto.password);
        if(existing_user==null)
            return Response.status(404)
                    .entity(
                            Map.of("message", "Username or password is incorrect.")
                    )
                    .build();
        if (existing_user.is_locked()) {
            LocalDateTime now = LocalDateTime.now();
            if (existing_user.getLock_until() != null) {
                if (now.isBefore(existing_user.getLock_until())) {
                    String reasonMsg = (existing_user.getLock_reason() != null && !existing_user.getLock_reason().isBlank())
                            ? ". Lý do: " + existing_user.getLock_reason()
                            : "";
                    return Response.status(Response.Status.FORBIDDEN)
                            .entity(Map.of("message", "Tài khoản của bạn đang bị khóa tạm thời đến " + existing_user.getLock_until() + reasonMsg))
                            .build();
                } else {
                    // Hết hạn khóa tạm thời -> tự động mở khóa
                    userService.unlockUser(existing_user.getId());
                }
            } else {
                // Khóa vĩnh viễn
                String reasonMsg = (existing_user.getLock_reason() != null && !existing_user.getLock_reason().isBlank())
                        ? ". Lý do: " + existing_user.getLock_reason()
                        : "";
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("message", "Tài khoản của bạn đã bị khóa vĩnh viễn" + reasonMsg))
                        .build();
            }
        }

        UUID myId = existing_user.getId();
        String role = existing_user.getRole().toString();

        userService.updateUserStatus(myId, true);

        String token = generateJwt(myId, role);
        return Response.ok(
                Map.of("token", token)
                )
                .build();
    }

}
