package alan.nguyen.repository;

import alan.nguyen.common.PostPrivacy;
import alan.nguyen.entity.Post;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PostRepo implements PanacheRepositoryBase<Post, UUID> {

    /**
     * Tìm bài viết còn hoạt động (chưa xóa mềm) theo ID
     */
    public Optional<Post> findActiveById(UUID id) {
        return find("id = ?1 and is_deleted = false", id).firstResultOptional();
    }

    /**
     * Lấy bài viết chi tiết kèm nạp sẵn (fetch join) author và mediaList
     */
    public Optional<Post> findActiveByIdWithDetails(UUID id) {
        return find("select distinct p from Post p left join fetch p.author left join fetch p.mediaList where p.id = ?1 and p.is_deleted = false", id)
                .firstResultOptional();
    }

    /**
     * Lấy bảng tin (Newsfeed) có phân trang
     * Điều kiện: Bài viết công khai PUBLIC hoặc bài viết của chính người dùng hiện tại
     */
    public PanacheQuery<Post> findFeed(UUID currentUserId, Page page) {
        return find("(privacy = ?1 or author.id = ?2) and is_deleted = false order by created_at desc",
                PostPrivacy.PUBLIC, currentUserId).page(page);
    }

    /**
     * Lấy bài viết trên dòng thời gian cá nhân (Profile Timeline) có phân trang
     * @param targetUserId Người sở hữu trang cá nhân
     * @param isOwner true nếu người đang xem chính là chủ trang cá nhân
     */
    public PanacheQuery<Post> findUserTimeline(UUID targetUserId, boolean isOwner, Page page) {
        if (isOwner) {
            return find("author.id = ?1 and is_deleted = false order by created_at desc", targetUserId)
                    .page(page);
        }
        return find("author.id = ?1 and privacy = ?2 and is_deleted = false order by created_at desc",
                targetUserId, PostPrivacy.PUBLIC).page(page);
    }
}
