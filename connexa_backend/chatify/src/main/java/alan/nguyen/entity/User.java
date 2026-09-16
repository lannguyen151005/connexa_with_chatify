package alan.nguyen.entity;

import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.UserDTO;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "users")
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "username", unique = true)
    private String username;
    @Column(name = "email", unique = true)
    private String email;
    @Column(name = "password")
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private SystemRole role = SystemRole.USER;
    @Column(name = "avatar_url")
    private String avatar_url;
    @Column(name = "is_online")
    private boolean is_online;
    @Column(name = "last_seen")
    private LocalDateTime last_seen;
    @Column(name = "created_at")
    private LocalDateTime created_at;


    public void map(UserDTO dto){
        this.id = null;
        this.username = dto.getUsername();
        this.email = dto.getEmail();
        this.password = dto.getPassword();
        this.role = SystemRole.USER;
        this.avatar_url = dto.getUsername();
        this.is_online = dto.is_online();
        this.last_seen = dto.getLast_seen();
        this.created_at = dto.getCreated_at();
    }
}
