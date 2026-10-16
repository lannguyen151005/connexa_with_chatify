package alan.nguyen.controller;


import alan.nguyen.common.ApiResponse;
import alan.nguyen.dto.chatify.user.UpdateProfileDTO;
import alan.nguyen.dto.chatify.user.UserDTO;
import alan.nguyen.dto.connexa.user.ProfileDetailDTO;
import alan.nguyen.entity.User;
import alan.nguyen.service.UserService;

import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.UUID;


@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class UserController {

    @Inject
    UserService userService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/{id}")
    @Authenticated
    public Response getProfile(
            @PathParam("id") UUID user_id
    ){
        return userService.getProfile(user_id);
    }

    @GET
    @Authenticated
    public Response getAll(){
            List<User> list = userService.getAll();
            return Response.ok(list).build();
    }
    @PUT
    @Path("/{id}")
    @Authenticated
    public Response updateUser(@PathParam("id") UUID id, UpdateProfileDTO dto){
            return userService.updateUser(id, dto);
    }

    @POST
    @PermitAll
    public Response addUser(UserDTO dto){
            return userService.addUser(dto);
    }
    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response deleteUser(UUID id){
            return userService.deleteUser(id);
    }

    @GET
    @Path("/profile/{id}")
    public Response getProfileDetail(UUID id){
        ProfileDetailDTO result = userService.getProfileDetail(id);
        return Response.ok(ApiResponse.success(result))
                .build();
    }
}

