package alan.nguyen.repository;

import alan.nguyen.dto.ProfileResponseDTO;
import alan.nguyen.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;

import java.util.UUID;

@ApplicationScoped
public class UserRepo implements PanacheRepositoryBase<User, UUID> {
    public Response getProfile(UUID userId) {
        String query = "SELECT u.email, u.avatar_url, u.username, u.password " +
                "FROM User u " +
                "WHERE u.id = ?1";
        ProfileResponseDTO profile = getEntityManager()
                .createQuery(query, ProfileResponseDTO.class)
                .setParameter(1, userId)
                .getSingleResult();
        return Response.ok(profile).build();
    }
}
