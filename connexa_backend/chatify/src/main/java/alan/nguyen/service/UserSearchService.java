package alan.nguyen.service;

import alan.nguyen.dto.PageResponseDTO;
import alan.nguyen.dto.UserSearchResponseDTO;

import java.util.UUID;

public interface UserSearchService {

    PageResponseDTO<UserSearchResponseDTO> search(
            String keyword,
            UUID currentUserId,
            int page,
            int size
    );
}
