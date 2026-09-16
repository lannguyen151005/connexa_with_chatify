package alan.nguyen.service.auth;

import alan.nguyen.dto.LoginRequestDTO;
import alan.nguyen.dto.UserDTO;
import alan.nguyen.entity.User;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.UserService;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

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
