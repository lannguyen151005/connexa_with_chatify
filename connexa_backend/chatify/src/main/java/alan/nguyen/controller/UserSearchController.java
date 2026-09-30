package alan.nguyen.controller;

import alan.nguyen.dto.UserSearchResponseDTO;
import alan.nguyen.service.UserSearchService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class UserSearchController {

    @Inject
    UserSearchService userSearchService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/search")
    public Response search(
            @QueryParam("keyword") String keyword
    ) {

        try {

            UUID currentUserId =
                    UUID.fromString(jwt.getSubject());

            List<UserSearchResponseDTO> result =
                    userSearchService.search(
                            keyword,
                            currentUserId
                    );

            return Response.ok(result).build();

        } catch (IllegalArgumentException e) {

            return Response.status(
                    Response.Status.UNAUTHORIZED
            ).entity(
                    Map.of(
                            "message",
                            "Token không hợp lệ"
                    )
            ).build();
        }
    }
}