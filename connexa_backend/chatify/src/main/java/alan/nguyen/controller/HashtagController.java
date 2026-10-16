package alan.nguyen.controller;

import alan.nguyen.common.ApiResponse;
import alan.nguyen.dto.hashtag.HashtagResponseDTO;
import alan.nguyen.service.HashtagService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/v1/hashtags")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class HashtagController {

    @Inject
    HashtagService hashtagService;

    /**
     * Lấy danh sách Top Hashtags thịnh hành nhất hệ thống
     */
    @GET
    @Path("/trending")
    public Response getTrendingHashtags(
            @QueryParam("limit") @DefaultValue("10") int limit
    ) {
        List<HashtagResponseDTO> result = hashtagService.getTrendingHashtags(limit);
        return Response.ok(ApiResponse.success("Lấy danh sách hashtag thịnh hành thành công", result)).build();
    }

    /**
     * Gợi ý hashtag theo tiền tố (dùng cho autocomplete khi người dùng gõ #...)
     */
    @GET
    @Path("/suggest")
    public Response suggestHashtags(
            @QueryParam("query") String query,
            @QueryParam("limit") @DefaultValue("5") int limit
    ) {
        List<HashtagResponseDTO> result = hashtagService.searchHashtags(query, limit);
        return Response.ok(ApiResponse.success("Lấy gợi ý hashtag thành công", result)).build();
    }
}
