package alan.nguyen.controller.auth;

import alan.nguyen.dto.chatify.user.LoginRequestDTO;
import alan.nguyen.dto.chatify.user.RegisterRequestDTO;
import alan.nguyen.service.UserService;
import alan.nguyen.service.auth.JwtService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/api/auth")
public class AuthController {

    @Inject
    JwtService service;
    @Inject
    UserService user_service;

    @POST
    @Path("/login")
    @PermitAll
    public Response login(LoginRequestDTO dto){
        return service.getToken(dto);
    }

    @POST
    @Path("/register")
    @PermitAll
    public Response sign_up(RegisterRequestDTO dto){
        return user_service.registerUser(dto);
    }

}
