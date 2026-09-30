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