package alan.nguyen.dto.post;

import alan.nguyen.common.PostPrivacy;
import alan.nguyen.entity.Post;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * DTO dữ liệu đầy đủ của bài viết gửi về cho Client
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponseDTO {

    private UUID id;
    private AuthorResponseDTO author;
    private String content;
    private PostPrivacy privacy;
    private int like_count;
    private int comment_count;
    private boolean is_liked;
    private boolean is_edited;
    private List<PostMediaDTO> media_list;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public static PostResponseDTO fromEntity(Post post) {
        if (post == null) {
            return null;
        }

        List<PostMediaDTO> media = post.getMediaList() == null
                ? Collections.emptyList()
                : post.getMediaList().stream()
                .map(PostMediaDTO::fromEntity)
                .toList();

        return PostResponseDTO.builder()
                .id(post.getId())
                .author(AuthorResponseDTO.fromEntity(post.getAuthor()))
                .content(post.getContent())
                .privacy(post.getPrivacy())
                .like_count(post.getLike_count())
                .comment_count(post.getComment_count())
                .is_liked(false) // Mặc định false, giai đoạn 2 sẽ kiểm tra user hiện tại đã like chưa
                .is_edited(post.is_edited())
                .media_list(media)
                .created_at(post.getCreated_at())
                .updated_at(post.getUpdated_at())
                .build();
    }
}
