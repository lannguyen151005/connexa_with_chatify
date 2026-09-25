package alan.nguyen.repository;

import alan.nguyen.entity.PostMedia;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PostMediaRepo implements PanacheRepositoryBase<PostMedia, UUID> {

    /**
     * Lấy toàn bộ tệp media của một bài viết theo thứ tự hiển thị
     */
    public List<PostMedia> findByPostId(UUID postId) {
        return list("post.id = ?1 order by display_order asc", postId);
    }

    /**
     * Xóa toàn bộ media của một bài viết
     */
    public long deleteByPostId(UUID postId) {
        return delete("post.id = ?1", postId);
    }
}
