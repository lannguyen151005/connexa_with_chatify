package alan.nguyen.dto;

import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private String username;
    private String email;
    private String password;
    private String avatar_url;
    private boolean is_online;
    private LocalDateTime last_seen;
    private LocalDateTime created_at;
    private String role;
}
