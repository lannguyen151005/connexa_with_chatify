package alan.nguyen.repository;

import alan.nguyen.entity.PostReaction;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PostReactionRepo implements PanacheRepositoryBase<PostReaction, UUID> {

    public Optional<PostReaction> findByPostAndUser(UUID postId, UUID userId) {
        return find("post.id = ?1 and author.id = ?2", postId, userId).firstResultOptional();
    }
}