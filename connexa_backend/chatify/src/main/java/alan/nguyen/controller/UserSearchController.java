package alan.nguyen.controller;

import alan.nguyen.common.ApiResponse;
import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.UserSearchResponseDTO;
import alan.nguyen.service.UserSearchService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Collections;
import java.util.UUID;

@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class UserSearchController {

    private static final int MAX_PAGE_SIZE = 30;
    private static final int DEFAULT_PAGE_SIZE = 20;

    @Inject
    UserSearchService userSearchService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/search")
    public Response search(
            @QueryParam("keyword") String keyword,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {

        if (page < 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(
                            "Số trang phải lớn hơn hoặc bằng 0"
                    ))
                    .build();
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(
                            "Kích thước trang phải từ 1 đến " + MAX_PAGE_SIZE
                    ))
                    .build();
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            return Response.ok(
                    ApiResponse.success(
                            "Tìm kiếm người dùng thành công",
                            PageResponseDTO.of(
                                    Collections.emptyList(),
                                    page,
                                    size,
                                    0,
                                    0
                            )
                    )
            ).build();
        }

        if (keyword.trim().length() > 200) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(
                            "Từ khóa tìm kiếm không được vượt quá 200 ký tự"
                    ))
                    .build();
        }

        UUID currentUserId = UUID.fromString(jwt.getSubject());

        PageResponseDTO<UserSearchResponseDTO> result =
                userSearchService.search(
                        keyword.trim(),
                        currentUserId,
                        page,
                        size
                );

        return Response.ok(
                ApiResponse.success(
                        "Tìm kiếm người dùng thành công",
                        result
                )
        ).build();
    }
}