
package alan.nguyen.controller;

import alan.nguyen.service.CloudinaryService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Path("/api/upload")
@Authenticated
public class FileUploadController {

    @Inject
    CloudinaryService cloudinaryService;

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadFile(
            @RestForm("file") FileUpload fileUpload
    ) {
        if (fileUpload == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Vui lòng chọn file"))
                    .build();
        }

        try {
            File file = fileUpload.filePath().toFile();

            String fileUrl = cloudinaryService.uploadFile(file);

            return Response.ok(
                    Map.of("url", fileUrl)
            ).build();

        } catch (IOException e) {
            return Response.serverError()
                    .entity(Map.of(
                            "error", "Upload file thất bại"
                    ))
                    .build();
        }
    }
}
