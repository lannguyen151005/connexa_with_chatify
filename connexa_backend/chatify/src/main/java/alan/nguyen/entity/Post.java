package alan.nguyen.entity;

import alan.nguyen.common.PostPrivacy;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy", nullable = false)
    @Builder.Default
    private PostPrivacy privacy = PostPrivacy.PUBLIC;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int like_count = 0;

    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private int comment_count = 0;

    @Column(name = "is_edited", nullable = false)
    @Builder.Default
    private boolean is_edited = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean is_deleted = false;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PostMedia> mediaList = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;

    @PrePersist
    protected void onCreate() {
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updated_at = LocalDateTime.now();
    }

    /**
     * Helper method đồng bộ quan hệ hai chiều giữa Post và PostMedia
     */
    public void addMedia(PostMedia media) {
        mediaList.add(media);
        media.setPost(this);
    }

    public void removeMedia(PostMedia media) {
        mediaList.remove(media);
        media.setPost(null);
    }
}
