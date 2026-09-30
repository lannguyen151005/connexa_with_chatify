package alan.nguyen.exception;

import alan.nguyen.common.ApiResponse;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class IllegalArgumentExceptionMapper implements ExceptionMapper<InvalidFormatException> {

    @Override
    public Response toResponse(InvalidFormatException exception) {
        String fieldName = exception.getPath().isEmpty() ? "trường dữ liệu" : exception.getPath().get(0).getFieldName();
        String errorMessage = String.format("Dữ liệu trường '%s' không đúng định dạng", fieldName);

        ApiResponse<Void> body = ApiResponse.error(errorMessage);

        return Response.status(Response.Status.BAD_REQUEST)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }
}
