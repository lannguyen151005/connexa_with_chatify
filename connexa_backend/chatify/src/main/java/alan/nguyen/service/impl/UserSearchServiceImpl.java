package alan.nguyen.service.impl;

import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.UserSearchResponseDTO;
import alan.nguyen.entity.User;
import alan.nguyen.repository.UserRepo;
import alan.nguyen.service.UserSearchService;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserSearchServiceImpl implements UserSearchService {

    @Inject
    UserRepo userRepo;

    @Override
    public PageResponseDTO<UserSearchResponseDTO> search(
            String keyword,
            UUID currentUserId,
            int page,
            int size
    ) {
        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 30);

        Page pageable = Page.of(pageIndex, pageSize);

        PanacheQuery<User> query = userRepo.searchUsers(
                keyword,
                currentUserId,
                pageable
        );

        List<UserSearchResponseDTO> items = query.list()
                .stream()
                .map(UserSearchResponseDTO::fromEntity)
                .toList();

        return PageResponseDTO.of(
                items,
                query.page().index,
                query.page().size,
                query.count(),
                query.pageCount()
        );
    }
}
