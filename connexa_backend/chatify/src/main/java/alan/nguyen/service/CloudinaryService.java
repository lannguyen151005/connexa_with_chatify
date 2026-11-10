
package alan.nguyen.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@ApplicationScoped
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @ConfigProperty(name = "app.cloudinary.url")
            String cloudinaryUrl
    ) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    public String uploadFile(File file) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file,
                ObjectUtils.asMap(
                        "resource_type", "auto"
                )
        );

        return uploadResult.get("secure_url").toString();
    }
}
