package alan.nguyen.service;

import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.admin.LockUserRequestDTO;
import alan.nguyen.dto.chatify.user.RegisterRequestDTO;
import alan.nguyen.dto.chatify.user.UpdateProfileDTO;
import alan.nguyen.dto.chatify.user.UserDTO;
import alan.nguyen.dto.connexa.user.ProfileDetailDTO;
import alan.nguyen.entity.Friendship;
import alan.nguyen.entity.User;
import alan.nguyen.repository.FriendshipRepo;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.impl.PostServiceImpl;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepo userRepo;

    @Inject
    JsonWebToken jwt;
    @Inject
    PostServiceImpl postServiceImpl;
    @Inject
    FriendshipRepo friendshipRepo;

    public List<User> getAll() {
        List<User> list = userRepo.findAll().list();
        return list;
    }

    @Transactional
    public Response addUser(UserDTO dto) {
        User existing_user = userRepo.find("email = ?1 or username = ?2", dto.getEmail(), dto.getUsername())
                .firstResult();
        if (existing_user != null)
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists"))
                    .build();
        User newUser = new User();
        newUser.setUsername(dto.username);
        newUser.setEmail(dto.email);
        newUser.setPassword(dto.password);
        newUser.setRole(dto.role);

        userRepo.persist(newUser);
        return Response.ok(
                Map.of("message", "Adding successfully")).build();
    }

    @Transactional
    public Response updateUser(UUID id, UpdateProfileDTO dto) {
        UUID myUserId = UUID.fromString(jwt.getSubject());
        if (!id.equals(myUserId)) {
            return Response.serverError()
                    .entity(
                            Map.of(
                                    "message",
                                    "unauthenticate"))
                    .build();
        }
        User existing_user = userRepo.findById(id);
        if (existing_user == null)
            return Response.status(404)
                    .entity(
                            Map.of("message", "User not found"))
                    .build();
        User checkEmail_Username = userRepo.find("email = ?1 or username = ?2", dto.email, dto.username).firstResult();
        if (checkEmail_Username != null && !checkEmail_Username.getId().equals(id))
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists"))
                    .build();

        existing_user.setEmail(dto.email);
        existing_user.setUsername(dto.username);
        existing_user.setPassword(dto.password);
        existing_user.setAvatar_url(dto.avatar_url);

        return Response.ok(
                Map.of("message", "Updating successfully")).build();
    }

    @Transactional
    public Response deleteUser(UUID id) {
        User existing_user = userRepo.findById(id);
        if (existing_user == null)
            return Response.status(404)
                    .entity(
                            Map.of("message", "User not found"))
                    .build();
        userRepo.delete(existing_user);
        return Response.ok(
                Map.of("message", "Deleting successfully")).build();
    }

    public boolean isValidRole(String role) {
        for (SystemRole r : SystemRole.values()) {
            if (r.name().equals(role))
                return true;
        }
        return false;
    }

    // Update user'status
    @Transactional
    public void updateUserStatus(UUID userId, boolean isOnline) {

    }

    @Transactional
    public Response registerUser(RegisterRequestDTO dto) {
        User existing_user = userRepo.find("email = ?1 or username = ?2", dto.email, dto.username).firstResult();
        if (existing_user != null)
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists"))
                    .build();
        User newUser = new User();
        newUser.setUsername(dto.username);
        newUser.setEmail(dto.email);
        newUser.setPassword(dto.password);
        newUser.set_online(false);
        newUser.setCreated_at(LocalDateTime.now());
        newUser.setRole(SystemRole.USER);

        userRepo.persist(newUser);
        return Response.ok(
                Map.of("message", "Adding successfully")).build();
    }

    public Response getProfile(UUID userId) {
        // UUID myUserId = UUID.fromString(jwt.getSubject());
        // if(!userId.equals(myUserId))
        // return Response.serverError()
        // .entity(
        // Map.of(
        // "message",
        // "unauthorize"
        // )
        // ).build();
        return userRepo.getProfile(userId);
    }

    public User login(String username, String password) {
        User existing_user = userRepo.find("username = ?1 AND password = ?2", username, password).firstResult();
        return existing_user;
    }

    public long countAllUsers() {
        return userRepo.count();
    }

    @Transactional
    public void anonymizeUser(UUID userId) {
        User user = userRepo.findById(userId);
        if (user != null) {
            if (user.getRole() == SystemRole.ADMIN) {
                throw new jakarta.ws.rs.WebApplicationException("Không thể xóa tài khoản Quản trị viên (Admin)",
                        Response.Status.BAD_REQUEST);
            }
            user.setUsername("Người dùng đã xóa");
            user.setEmail("deleted_" + UUID.randomUUID().toString() + "@chatify.com");
            user.setPassword(UUID.randomUUID().toString());
            user.setAvatar_url("https://cdn-icons-png.flaticon.com/512/149/149071.png");

            userRepo.persist(user);
        }
    }

    @Transactional
    public Response lockUser(UUID userId, LockUserRequestDTO dto, UUID currentAdminId) {
        User user = userRepo.findById(userId);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", "Không tìm thấy người dùng"))
                    .build();
        }

        // Chính sách bảo vệ Admin: Không cho phép khóa tài khoản Admin
        if (user.getRole() == SystemRole.ADMIN) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Không thể khóa tài khoản Quản trị viên (Admin)"))
                    .build();
        }

        if (dto.getType() == null || dto.getType().trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Loại khóa không được để trống (TEMPORARY hoặc PERMANENT)"))
                    .build();
        }

        String lockType = dto.getType().trim().toUpperCase();
        if ("TEMPORARY".equals(lockType)) {
            if (dto.getDurationDays() == null
                    || (dto.getDurationDays() != 3 && dto.getDurationDays() != 7 && dto.getDurationDays() != 30)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("message",
                                "Thời hạn khóa tạm thời không hợp lệ (chỉ chấp nhận 3, 7 hoặc 30 ngày)"))
                        .build();
            }
            user.set_locked(true);
            user.setLock_until(LocalDateTime.now().plusDays(dto.getDurationDays()));
            user.setLock_reason(dto.getReason());
        } else if ("PERMANENT".equals(lockType)) {
            user.set_locked(true);
            user.setLock_until(null);
            user.setLock_reason(dto.getReason());
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Loại khóa không hợp lệ (phải là TEMPORARY hoặc PERMANENT)"))
                    .build();
        }

        userRepo.persist(user);
        return Response.ok(Map.of(
                "message", "Khóa tài khoản thành công",
                "is_locked", user.is_locked(),
                "lock_until", user.getLock_until() != null ? user.getLock_until().toString() : "Vĩnh viễn",
                "reason", user.getLock_reason() != null ? user.getLock_reason() : "")).build();
    }

    @Transactional
    public Response unlockUser(UUID userId) {
        User user = userRepo.findById(userId);
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", "Không tìm thấy người dùng"))
                    .build();
        }

        user.set_locked(false);
        user.setLock_until(null);
        user.setLock_reason(null);
        userRepo.persist(user);

        return Response.ok(Map.of("message", "Mở khóa tài khoản thành công")).build();
    }

    public ProfileDetailDTO getProfileDetail(UUID id) {

        ProfileDetailDTO result = new ProfileDetailDTO();

        User targetUser = userRepo.findById(id);

        if (targetUser == null) {
            return null;
        }

        result.username = targetUser.getUsername();
        result.avatarUrl = targetUser.getAvatar_url();
        result.note = targetUser.getNote();
        result.birthday = targetUser.getBirthday();

        UUID currentUserId = UUID.fromString(jwt.getSubject());

        if (currentUserId.equals(id)) {
            result.requestStatus = null;
            return result;
        }

        Friendship friendship = friendshipRepo.find(
                "(sender.id = ?1 AND receiver.id = ?2) " +
                        "OR (sender.id = ?3 AND receiver.id = ?4)",
                currentUserId, id, id, currentUserId).firstResult();

        result.requestStatus = friendship != null ? friendship.getStatus() : null;

        return result;
    }
}
