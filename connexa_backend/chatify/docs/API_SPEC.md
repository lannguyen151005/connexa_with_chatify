# API_SPEC.md - Đặc Tả API Connexa (Giai Đoạn 1: Quản Lý Bài Viết)

Tài liệu đặc tả các giao diện lập trình ứng dụng (RESTful API), định dạng Request/Response DTO và quy chuẩn mã lỗi cho hệ thống Connexa Backend.

---

## 1. Quy chuẩn chung (Global Conventions)

- **Base URL**: `/api/v1`
- **Định dạng dữ liệu**: `application/json` (trừ API upload file dùng `multipart/form-data`).
- **Xác thực (Authentication)**: Đính kèm Header cho mọi API yêu cầu bảo mật:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```
- **Cấu trúc phản hồi chuẩn (`ApiResponse<T>`)**:
  ```json
  {
    "success": true,
    "message": "Thông báo kết quả thao tác",
    "data": { ... }
  }
  ```
- **Cấu trúc phân trang chuẩn (`PageResponseDTO<T>`)**:
  ```json
  {
    "items": [ ... ],
    "page": 0,
    "size": 10,
    "total_elements": 100,
    "total_pages": 10,
    "is_last": false
  }
  ```

---

## 2. Danh mục Endpoint Module Bài viết (Post Endpoints)

| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/posts` | User | Tạo bài viết mới (kèm danh sách media) |
| `GET` | `/api/v1/posts/{id}` | Public / User | Xem chi tiết 1 bài viết |
| `GET` | `/api/v1/posts/feed` | User | Lấy bảng tin (Newsfeed) có phân trang |
| `GET` | `/api/v1/posts/user/{userId}` | User | Lấy bài viết trang cá nhân (Timeline) |
| `PUT` | `/api/v1/posts/{id}` | Author | Cập nhật nội dung / quyền riêng tư |
| `DELETE` | `/api/v1/posts/{id}` | Author / Admin | Xóa mềm bài viết (`is_deleted = true`) |
| `GET` | `/api/v1/posts/search` | User | Tìm kiếm bài viết theo từ khóa nội dung (Phân trang, lọc privacy) |
| `GET` | `/api/v1/posts/tags/{tagName}` | User | Tìm kiếm bài viết theo hashtag (Phân trang, lọc privacy) |
| `GET` | `/api/v1/hashtags/trending` | User | Lấy danh sách Top Hashtags thịnh hành |
| `GET` | `/api/v1/hashtags/suggest` | User | Gợi ý tự động hoàn thành Hashtag theo tiền tố |

---

## 3. Chi tiết từng API (Endpoint Specifications)

### 3.1. Tạo bài viết mới (Create Post)
- **Endpoint**: `POST /api/v1/posts`
- **Headers**: `Authorization: Bearer <token>`
- **Validation Rules**:
  - `content`: `@NotBlank`, tối đa 2000 ký tự.
  - `privacy`: Mặc định `'PUBLIC'` (Cho phép: `PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`).
  - `media_list`: Tối đa 10 tệp.
- **Request Body (`CreatePostRequestDTO`)**:
  ```json
  {
    "content": "Hôm nay thời tiết thật đẹp cùng nhóm Connexa! #Quarkus #Java",
    "privacy": "PUBLIC",
    "media_list": [
      {
        "media_url": "https://res.cloudinary.com/.../image1.jpg",
        "media_type": "IMAGE",
        "display_order": 0
      },
      {
        "media_url": "https://res.cloudinary.com/.../video1.mp4",
        "media_type": "VIDEO",
        "display_order": 1
      }
    ]
  }
  ```
- **Response Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Đăng bài viết thành công",
    "data": {
      "id": "c1f7b8a2-3e4d-4a1b-9f2c-1a2b3c4d5e6f",
      "author": {
        "id": "a9d8e7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        "username": "alan_nguyen",
        "avatar_url": "https://res.cloudinary.com/.../avatar.jpg"
      },
      "content": "Hôm nay thời tiết thật đẹp cùng nhóm Connexa! #Quarkus #Java",
      "privacy": "PUBLIC",
      "like_count": 0,
      "comment_count": 0,
      "is_liked": false,
      "is_edited": false,
      "media_list": [
        {
          "id": "f5e4d3c2-1b0a-9f8e-7d6c-5b4a3f2e1d0c",
          "media_url": "https://res.cloudinary.com/.../image1.jpg",
          "media_type": "IMAGE",
          "display_order": 0
        }
      ],
      "created_at": "2026-09-25T18:15:00",
      "updated_at": "2026-09-25T18:15:00"
    }
  }
  ```

---

### 3.2. Xem chi tiết bài viết (Get Post Detail)
- **Endpoint**: `GET /api/v1/posts/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response Success (200 OK)**: Trả về đối tượng `PostResponseDTO` tương tự API tạo bài viết.
- **Lỗi thường gặp**:
  - `404 Not Found`: Bài viết không tồn tại hoặc `is_deleted = true`.
  - `403 Forbidden`: Bài viết ở chế độ `PRIVATE` và người yêu cầu không phải tác giả.

---

### 3.3. Lấy bảng tin (Get Newsfeed)
- **Endpoint**: `GET /api/v1/posts/feed`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (int, default 0): Số trang cần lấy.
  - `size` (int, default 10, max 50): Số bài viết trên một trang.
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lấy bảng tin thành công",
    "data": {
      "items": [
        {
          "id": "c1f7b8a2-3e4d-4a1b-9f2c-1a2b3c4d5e6f",
          "author": {
            "id": "a9d8e7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
            "username": "alan_nguyen",
            "avatar_url": "https://res.cloudinary.com/.../avatar.jpg"
          },
          "content": "Nội dung bài viết...",
          "privacy": "PUBLIC",
          "like_count": 0,
          "comment_count": 0,
          "is_liked": false,
          "is_edited": false,
          "media_list": [],
          "created_at": "2026-09-25T17:30:00",
          "updated_at": "2026-09-25T17:30:00"
        }
      ],
      "page": 0,
      "size": 10,
      "total_elements": 1,
      "total_pages": 1,
      "is_last": true
    }
  }
  ```

---

### 3.4. Lấy bài viết trang cá nhân (Get User Timeline)
- **Endpoint**: `GET /api/v1/posts/user/{userId}`
- **Query Parameters**: `page` (default 0), `size` (default 10).
- **Response Success (200 OK)**: Trả về `ApiResponse<PageResponseDTO<PostResponseDTO>>`.

---

### 3.5. Cập nhật bài viết (Update Post)
- **Endpoint**: `PUT /api/v1/posts/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Ràng buộc**: Bắt buộc kiểm tra `currentUserId == post.user_id`. Không khớp trả về 403.
- **Request Body (`UpdatePostRequestDTO`)**:
  ```json
  {
    "content": "Nội dung bài viết sau khi chỉnh sửa...",
    "privacy": "FRIENDS_ONLY"
  }
  ```
- **Response Success (200 OK)**: Trả về bài viết cập nhật kèm `is_edited: true` và `updated_at` thời gian hiện tại.

---

### 3.6. Xóa bài viết (Delete Post - Soft Delete)
- **Endpoint**: `DELETE /api/v1/posts/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Ràng buộc**: Tác giả bài viết hoặc tài khoản có role `ADMIN` mới được quyền xóa.
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Đã xóa bài viết thành công",
    "data": null
  }
  ```

---

## 4. API Dùng Chung Liên Kết: Tải Lên Media (Shared Cloudinary Upload)
> **Lưu ý**: Đây là API dùng chung của toàn hệ thống (đã có sẵn tại `alan.nguyen.controller.FileUploadController`), không thuộc `PostController`. Được ghi chú tại đây để Frontend nắm luồng 2 bước khi đăng bài có ảnh/video.

- **Endpoint**: `POST /api/upload`
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Request Form-Data**:
  - `file`: File nhị phân (Ảnh: `.jpg`, `.png`, `.webp` hoặc Video: `.mp4`).
- **Response Success (200 OK)**:
  ```json
  {
    "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }
  ```
- **Luồng tích hợp cho Frontend**:
  1. Frontend gọi `POST /api/upload` với file đã chọn $\rightarrow$ Nhận về `{ "url": "..." }`.
  2. Frontend đưa `url` này vào `media_url` trong `media_list` của `CreatePostRequestDTO`.
  3. Frontend gọi `POST /api/v1/posts` để hoàn tất lưu bài viết.

---

## 5. Danh Mục Mã Lỗi Chuẩn (Error Status Codes)

| HTTP Code | Enum Mã Lỗi | Mô tả | Cấu trúc Response Lỗi |
| :--- | :--- | :--- | :--- |
| `200 OK` | `SUCCESS` | Xử lý yêu cầu thành công | `{"success": true, ...}` |
| `201 Created` | `CREATED` | Tạo mới tài nguyên thành công | `{"success": true, ...}` |
| `400 Bad Request` | `VALIDATION_ERROR` | Dữ liệu rỗng hoặc vi phạm `@Valid` | `{"success": false, "message": "...", "data": null}` |
| `401 Unauthorized` | `UNAUTHORIZED` | Token không hợp lệ hoặc hết hạn | `{"success": false, "message": "...", "data": null}` |
| `403 Forbidden` | `FORBIDDEN` | Không có quyền sửa/xóa tài nguyên này | `{"success": false, "message": "...", "data": null}` |
| `404 Not Found` | `NOT_FOUND` | Bài viết không tồn tại hoặc đã xóa mềm | `{"success": false, "message": "...", "data": null}` |
| `500 Internal Error` | `SERVER_ERROR` | Lỗi phát sinh ngoài dự kiến từ hệ thống | `{"success": false, "message": "...", "data": null}` |

## 6. Danh mục Endpoint Module Tương tác Bài viết (Post Interaction Endpoints)

| Phương thức | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/posts/{postId}/reactions` | User | Thả / Đổi / Hủy biểu cảm (Reaction) bài viết |
| `POST` | `/api/v1/posts/{postId}/comments` | User | Tạo bình luận mới (hoặc trả lời bình luận) |
| `GET` | `/api/v1/posts/{postId}/comments` | Public / User | Lấy danh sách bình luận của bài viết (Phân trang) |
| `DELETE` | `/api/v1/posts/comments/{commentId}` | Author / Post Owner | Xóa mềm bình luận (`is_deleted = true`) |

---

## 7. Chi tiết API Tương tác Bài viết (Interaction Endpoint Specifications)

### 7.1. Tương tác biểu cảm bài viết (Toggle Post Reaction)
- **Endpoint**: `POST /api/v1/posts/{postId}/reactions`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `postId` (UUID) - ID của bài viết cần tương tác.
- **Validation Rules**:
  - `type`: `@NotNull`, nhận các giá trị enum: `LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`.
- **Request Body (`ReactionRequestDTO`)**:
  ```json
  {
    "type": "LIKE"
  }
  ```

- **Response Success (200 OK)**:
  ```json
  {
  "success": true,
  "message": "Thực hiện tương tác thành công",
  "data": null
  }
  ```

### 7.2. Tạo bình luận mới (Create Comment)
- **Endpoint**: `POST /api/v1/posts/{postId}/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `postId` (UUID) - ID của bài viết cần tương tác.
- **Validation Rules**:
  - `content`: `@NotBlank`, content: @NotBlank, tối đa 1000 ký tự.
  - `parent_id`:  UUID (Tùy chọn). Bắt buộc phải tồn tại trong bảng post_comments nếu truyền.
- **Request Body (`ReactionRequestDTO`)**:
  ```json
   {
  "content": "v",
  "parentId": "54E3Dc8B-D6f4-E5b0-495f-7CaB0A76Ddad"
  }
  ```
  
  ```json
  {
    "content": "v"
  }
  ```
  
- **Response Success (200 OK)**:
  ```json
  {
  "success": true,
  "message": "Bình luận thành công",
  "data": {
    "id": "d85a0fc8-bc87-4db1-a0e3-eb401cc724af",
    "postId": "d67dae84-5082-4309-9bd4-f4ffba493650",
    "authorId": "3361f90e-4063-4e21-8b49-cafc660f2d3c",
    "authorUsername": "string",
    "authorAvatarUrl": null,
    "content": "v",
    "parentId": null,
    "createdAt": "2026-09-26T21:14:24.9758098"
  }
  }
  ```

### 7.3. Lấy danh sách bình luận (Get Post Comments)
- **Endpoint**: `GET /api/v1/posts/{postId}/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `postId` (UUID) - ID của bài viết cần tương tác.
- **Validation Rules**:
  - `page (int, default 0)`: Số trang cần lấy.

  - `size (int, default 10, max 50)`: Số bình luận trên một trang.

- **Response Success (200 OK)**:
  ```json
  {
  "success": true,
  "message": "Lấy danh sách bình luận thành công",
  "data": {
  "items": [
  {
  "id": "d85a0fc8-bc87-4db1-a0e3-eb401cc724af",
  "postId": "d67dae84-5082-4309-9bd4-f4ffba493650",
  "authorId": "3361f90e-4063-4e21-8b49-cafc660f2d3c",
  "authorUsername": "string",
  "authorAvatarUrl": null,
  "content": "v",
  "parentId": null,
  "createdAt": "2026-09-26T21:14:24.97581"
  },
  {
  "id": "beedf170-7b31-4b4b-b398-263af9a34184",
  "postId": "d67dae84-5082-4309-9bd4-f4ffba493650",
  "authorId": "3361f90e-4063-4e21-8b49-cafc660f2d3c",
  "authorUsername": "string",
  "authorAvatarUrl": null,
  "content": "v",
  "parentId": null,
  "createdAt": "2026-09-26T21:14:22.922791"
  }
  ],
  "page": 0,
  "size": 10,
  "total_elements": 2,
  "total_pages": 1,
  "is_last": true
  }
  }
  ```

### 7.4. Xóa bình luận (Delete Comment - Soft Delete)
- **Endpoint**: `DELETE /api/v1/posts/comments/{commentId}`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `commentId` (UUID) - ID của binh luan cần tương tác.
- **Ràng buộc**: Chỉ tác giả của bình luận hoặc chủ sở hữu bài viết mới có quyền xóa. Nếu không thỏa mãn trả về 403 Forbidden.
- **Response Success (200 OK)**:
  ```json
  {
  "success": true,
  "message": "Đã xóa bình luận thành công",
  "data": null
  }
  ```

---

## 8. Danh mục Endpoint Tìm kiếm Bài viết & Hashtag (Search & Hashtag APIs)

### 8.1. Tìm kiếm bài viết theo từ khóa (Search Posts by Keyword)
- **Endpoint**: `GET /api/v1/posts/search`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `keyword` (String, required): Từ khóa tìm kiếm trong nội dung bài viết.
    - *Validation*: Tối đa 200 ký tự (vượt quá trả về `400 Bad Request`). Không tự ý truncate/cắt ngắn từ khóa.
    - *Xử lý chuỗi rỗng*: Nếu `keyword` là `null`, chuỗi rỗng hoặc chỉ toàn khoảng trắng, API trả về ngay HTTP 200 kèm danh sách rỗng (tránh query database không cần thiết).
  - `page` (int, optional, default: 0): Số trang cần lấy (`page >= 0`, nếu `< 0` trả về `400 Bad Request`).
  - `size` (int, optional, default: 20): Kích thước trang (`1 <= size <= 30`, nếu ngoài khoảng trả về `400 Bad Request`).
- **Quy tắc phân quyền (Privacy)**:
  - Chỉ trả về các bài viết chưa bị xóa mềm (`is_deleted = false`).
  - Bài viết `PUBLIC`: Mọi người đều xem được.
  - Bài viết `PRIVATE`: Chỉ tác giả xem được.
  - Bài viết `FRIENDS_ONLY`: Tác giả và bạn bè có quan hệ `ACCEPTED` mới xem được.
- **Tối ưu hóa hiệu năng (O(1) Batch Queries)**:
  - Sử dụng Batch Loading nạp toàn bộ Media và Hashtag cho $N$ bài viết trong trang chỉ với 3 câu truy vấn SQL độc lập, triệt tiêu hoàn toàn vấn đề N+1 query.
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Tìm kiếm bài viết thành công",
    "data": {
      "items": [
        {
          "id": "c1f7b8a2-3e4d-4a1b-9f2c-1a2b3c4d5e6f",
          "author": {
            "id": "a9d8e7c6-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
            "username": "alan_nguyen",
            "avatar_url": "https://res.cloudinary.com/.../avatar.jpg"
          },
          "content": "Hôm nay đi chơi #dalat cùng bạn bè",
          "privacy": "PUBLIC",
          "like_count": 5,
          "comment_count": 2,
          "is_liked": false,
          "is_edited": false,
          "media_list": [],
          "hashtags": ["dalat"],
          "created_at": "2026-10-04T12:00:00",
          "updated_at": "2026-10-04T12:00:00"
        }
      ],
      "page": 0,
      "size": 20,
      "total_elements": 1,
      "total_pages": 1,
      "is_last": true
    }
  }
  ```
- **Lỗi thường gặp (Error Responses)**:
  - `400 Bad Request`:
    - `{"success": false, "message": "Số trang (page) phải lớn hơn hoặc bằng 0", "data": null}`
    - `{"success": false, "message": "Kích thước trang (size) phải nằm trong khoảng từ 1 đến 30", "data": null}`
    - `{"success": false, "message": "Từ khóa tìm kiếm không được vượt quá 200 ký tự", "data": null}`

---

### 8.2. Tìm kiếm bài viết theo Hashtag (Search Posts by Hashtag)
- **Endpoint**: `GET /api/v1/posts/tags/{tagName}`
- **Headers**: `Authorization: Bearer <token>`
- **Path Variable**: `tagName` (String, required): Tên hashtag (hỗ trợ cả dạng `dalat` hoặc `#dalat`).
  - *Validation*: Tối đa 100 ký tự (vượt quá trả về `400 Bad Request`).
  - *Chuẩn hóa*: Hệ thống tự động loại bỏ tiền tố `#` (nếu có), chuyển về chữ thường (`toLowerCase(Locale.ROOT)`) để tận dụng B-Tree Index trên trường `hashtags.name`.
  - *Xử lý rỗng*: Nếu sau khi bỏ `#` mà chuỗi rỗng (ví dụ `#`), API trả về HTTP 200 kèm danh sách rỗng.
- **Query Parameters**:
  - `page` (int, optional, default: 0): Số trang (`page >= 0`, nếu `< 0` trả về `400 Bad Request`).
  - `size` (int, optional, default: 20): Kích thước trang (`1 <= size <= 30`, nếu ngoài khoảng trả về `400 Bad Request`).
- **Quy tắc phân quyền (Privacy)**: Tương tự như tìm kiếm theo từ khóa.
- **Response Success (200 OK)**: Cấu trúc tương tự `GET /api/v1/posts/search`.
- **Lỗi thường gặp (Error Responses)**:
  - `400 Bad Request`:
    - `{"success": false, "message": "Số trang (page) phải lớn hơn hoặc bằng 0", "data": null}`
    - `{"success": false, "message": "Kích thước trang (size) phải nằm trong khoảng từ 1 đến 30", "data": null}`
    - `{"success": false, "message": "Hashtag không được vượt quá 100 ký tự", "data": null}`

---

### 8.3. Lấy danh sách Top Hashtags thịnh hành (Trending Hashtags)
- **Endpoint**: `GET /api/v1/hashtags/trending`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit` (int, optional, default: 10): Số lượng hashtag thịnh hành muốn lấy.
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lấy danh sách hashtag thịnh hành thành công",
    "data": [
      {
        "id": "c1f7b8a2-3e4d-4a1b-9f2c-1a2b3c4d5e6f",
        "name": "dalat",
        "usage_count": 15,
        "created_at": "2026-10-04T10:00:00"
      }
    ]
  }
  ```

---

### 8.4. Gợi ý Hashtag tự động hoàn thành (Autocomplete Suggestion)
- **Endpoint**: `GET /api/v1/hashtags/suggest`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `query` (String, required): Tiền tố hashtag người dùng đang gõ (ví dụ: `da` hoặc `#da`).
  - `limit` (int, optional, default: 5): Số lượng gợi ý muốn lấy.
  - Khi người dùng chuẩn bị đăng bài hoặc bình luận và gõ từ khóa (ví dụ: #da), ứng dụng frontend sẽ liên tục gọi API này. API sẽ tìm kiếm trong cơ sở dữ liệu các hashtag bắt đầu bằng chữ da (như #dalat, #danang, #datuyet) và trả về danh sách các hashtag phổ biến nhất (dựa vào usage_count - số lượng bài viết sử dụng hashtag đó) để hiển thị thành một danh sách thả xuống (dropdown) cho người dùng chọn nhanh.
- **Response Success (200 OK)**: Cấu trúc danh sách `HashtagResponseDTO` sắp xếp theo số lượng bài viết giảm dần (`usage_count DESC`).
  ```json
  {
    "success": true,
    "message": "Lấy gợi ý hashtag thành công",
    "data": [
      {
        "id": "c1f7b8a2-3e4d-4a1b-9f2c-1a2b3c4d5e6f",
        "name": "dalat",
        "usage_count": 15,
        "created_at": "2026-10-04T10:00:00"
      },
      {
        "id": "e8d7c6b5-4a3b-2c1d-0e9f-8a7b6c5d4e3f",
        "name": "danang",
        "usage_count": 8,
        "created_at": "2026-10-04T11:00:00"
      }
    ]
  }
  ```

---

## 9. Danh mục API Quản Trị Hệ Thống (Admin Endpoints - Mức 1)

Yêu cầu người dùng đăng nhập với vai trò `ADMIN` (`@RolesAllowed("ADMIN")`). Header: `Authorization: Bearer <token>`.

### 9.1. Ghim / Bỏ ghim bài viết (Pin/Unpin Post)
- **Endpoint**: `PATCH /api/admin/posts/{id}/pin`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "isPinned": true
  }
  ```
  *(Để bỏ ghim: gửi `"isPinned": false`)*
- **Response Success (200 OK)**: Trả về `ApiResponse<PostResponseDTO>` với trường `is_pinned` tương ứng.
- **Ràng buộc**: Bài viết bị xóa mềm hoặc không tồn tại sẽ trả về `404 Not Found`. Khi bài viết được ghim, `GET /api/v1/posts/feed` sẽ ưu tiên đưa lên đầu nhưng vẫn giữ nguyên đầy đủ quy tắc quyền riêng tư (PUBLIC, FRIENDS_ONLY, PRIVATE).

---

### 9.2. Danh sách bài viết quản trị (Get Admin Posts)
- **Endpoint**: `GET /api/admin/posts`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**:
  - `page` (int, default: 0)
  - `size` (int, default: 10, max: 50)
- **Response Success (200 OK)**: Cấu trúc phân trang `PageResponseDTO<PostResponseDTO>` liệt kê tất cả bài viết chưa bị xóa mềm, sắp xếp theo `isPinned DESC, createdAt DESC`.

---

### 9.3. Khóa tài khoản người dùng (Lock User)
- **Endpoint**: `PATCH /api/admin/users/{id}/lock`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body - Khóa tạm thời**:
  ```json
  {
    "type": "TEMPORARY",
    "durationDays": 7,
    "reason": "Spam nội dung vi phạm"
  }
  ```
  *(Thời hạn `durationDays` hợp lệ: `3`, `7`, hoặc `30` ngày. Các giá trị khác trả về `400 Bad Request`)*
- **Request Body - Khóa vĩnh viễn**:
  ```json
  {
    "type": "PERMANENT",
    "reason": "Lừa đảo chiếm đoạt tài sản"
  }
  ```
- **Quy tắc bảo mật & phân quyền**:
  - Không được phép khóa tài khoản Quản trị viên (`ADMIN`), vi phạm trả về `400 Bad Request`.
  - Tài khoản bị khóa khi đăng nhập sẽ nhận phản hồi `403 Forbidden` kèm thông báo lý do và thời gian khóa.
  - Tài khoản khóa tạm thời tự động mở khóa khi đã quá thời điểm `lock_until`.

---

### 9.4. Mở khóa tài khoản người dùng (Unlock User)
- **Endpoint**: `PATCH /api/admin/users/{id}/unlock`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response Success (200 OK)**:
  ```json
  {
    "message": "Mở khóa tài khoản thành công"
  }
  ```

---

### 9.5. Chỉ số Dashboard Tổng Quan (Get Dashboard Metrics)
- **Endpoint**: `GET /api/admin/dashboard`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response Success (200 OK)**:
  ```json
  {
    "totalUsers": 150,
    "totalRooms": 24,
    "totalMessagesToday": 320,
    "totalPosts": 85,
    "totalInteractions": 412,
    "isBotEnabled": true,
    "botTokensUsed": 15420,
    "chartData": [
      {
        "date": "12/10",
        "messages": 120
      }
    ]
  }
  ```
  *(Lưu ý: `totalPosts` đếm toàn bộ bài viết chưa bị xóa mềm `isDeleted = false`. `totalInteractions` đếm tổng số bình luận hợp lệ + reaction hợp lệ trên các bài viết chưa bị xóa mềm)*

