package alan.nguyen.service;

import alan.nguyen.common.SystemRole;
import alan.nguyen.dto.RegisterRequestDTO;
import alan.nguyen.dto.UpdateProfileDTO;
import alan.nguyen.dto.UserDTO;
import alan.nguyen.entity.User;
import alan.nguyen.repository.UserRepo;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
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
public class UserService{

    @Inject
    UserRepo userRepo;

    @Inject
    JsonWebToken jwt;

    public List<User> getAll(){
        List<User> list = userRepo.findAll().list();
        return list;
    }
    @Transactional
    public Response addUser(UserDTO dto){
        User existing_user = userRepo.find("email = ?1 or username = ?2", dto.getEmail(), dto.getUsername()).firstResult();
        if(existing_user!=null)
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists")
                    )
                    .build();
        User newUser = new User();
        newUser.map(dto);
        userRepo.persist(newUser);
        return Response.ok(
                Map.of("message", "Adding successfully")
        ).build();
    }
    @Transactional
    public Response updateUser(UUID id, UpdateProfileDTO dto){
        UUID myUserId = UUID.fromString(jwt.getSubject());
        if(!id.equals(myUserId)){
            return Response.serverError()
                    .entity(
                            Map.of(
                                    "message",
                                    "unauthenticate"
                            )
                    ).build();
        }
        User existing_user = userRepo.findById(id);
        if(existing_user==null)
            return Response.status(404)
                    .entity(
                            Map.of("message", "User not found")
                    )
                    .build();
        User checkEmail_Username = userRepo.find("email = ?1 or username = ?2", dto.email, dto.username).firstResult();
        if(checkEmail_Username!=null && !checkEmail_Username.getId().equals(id))
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists")
                    )
                    .build();

        existing_user.setEmail(dto.email);
        existing_user.setUsername(dto.username);
        existing_user.setPassword(dto.password);
        existing_user.setAvatar_url(dto.avatar_url);

        return Response.ok(
                Map.of("message", "Updating successfully")
        ).build();
    }
    @Transactional
    public Response deleteUser(UUID id){
        User existing_user = userRepo.findById(id);
        if(existing_user==null)
            return Response.status(404)
                    .entity(
                            Map.of("message", "User not found")
                    )
                    .build();
        userRepo.delete(existing_user);
        return Response.ok(
                Map.of("message", "Deleting successfully")
        ).build();
    }
    public boolean isValidRole(String role){
        for(SystemRole r : SystemRole.values()){
            if(r.name().equals(role))
                return true;
        }
        return false;
    }
    //Update user'status
    @Transactional
    public void updateUserStatus(UUID userId, boolean isOnline){
        User existing_user = userRepo.findById(userId);
        if(existing_user!=null){
            existing_user.set_online(isOnline);
            if(!isOnline){
                existing_user.setLast_seen(LocalDateTime.now());
            }
            userRepo.persist(existing_user);
        }
    }

    @Transactional
    public Response registerUser(RegisterRequestDTO dto) {
        User existing_user = userRepo.find("email = ?1 or username = ?2", dto.email, dto.username).firstResult();
        if(existing_user!=null)
            return Response.status(400)
                    .entity(
                            Map.of("message", "Email or username already exists")
                    )
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
                Map.of("message", "Adding successfully")
        ).build();
    }

    public Response getProfile(UUID userId) {
        UUID myUserId = UUID.fromString(jwt.getSubject());
        if(!userId.equals(myUserId))
            return Response.serverError()
                    .entity(
                            Map.of(
                                    "message",
                                    "unauthorize"
                            )
                    ).build();
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
            user.setUsername("Người dùng đã xóa");
            user.setEmail("deleted_" + UUID.randomUUID().toString() + "@chatify.com");
            user.setPassword(UUID.randomUUID().toString());
            user.setAvatar_url("https://cdn-icons-png.flaticon.com/512/149/149071.png");

            userRepo.persist(user);
        }
    }
}
