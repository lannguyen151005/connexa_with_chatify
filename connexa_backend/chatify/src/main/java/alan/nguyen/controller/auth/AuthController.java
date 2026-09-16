package alan.nguyen.controller.auth;

import alan.nguyen.dto.LoginRequestDTO;
import alan.nguyen.dto.RegisterRequestDTO;
import alan.nguyen.dto.UserDTO;
import alan.nguyen.service.UserService;
import alan.nguyen.service.auth.JwtService;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.UUID;

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
