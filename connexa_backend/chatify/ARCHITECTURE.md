# ARCHITECTURE.md - Kiến Trúc Hệ Thống Backend Connexa

Tài liệu mô tả chi tiết kiến trúc phần mềm, thiết kế cơ sở dữ liệu, các tầng xử lý và quy chuẩn kỹ thuật cho hệ thống mạng xã hội Connexa (Chatify Backend).

---

## 1. Tổng quan hệ thống (System Overview)
- **Mô hình kiến trúc**: **Modular Monolith** (Nguyên khối theo mô-đun).
  - *Lý do*: Phù hợp hoàn hảo với quy mô đồ án 5 người. Đảm bảo tính đóng gói độc lập giữa các tính năng mà không tốn chi phí vận hành phức tạp của Microservices.
- **Phong cách giao tiếp**:
  - **RESTful API** (JSON): Dành cho toàn bộ các thao tác nghiệp vụ CRUD (Auth, Post, Profile, Friend, Comment, Reaction).
  - **WebSockets** (Quarkus WebSockets Next): Dành cho giao tiếp hai chiều thời gian thực (Nhắn tin, Thông báo).

---

## 2. Công nghệ cốt lõi (Tech Stack Justification)

| Thành phần | Công nghệ | Lý do lựa chọn cho đồ án |
| :--- | :--- | :--- |
| **Runtime & Core** | Java 17 + Quarkus 3.x | Hiệu năng cao, khởi động cực nhanh, tối ưu RAM, hỗ trợ Dev-UI trực quan. |
| **Persistence / ORM** | Hibernate ORM với Panache | Active Record / Repository pattern gọn nhẹ, giảm tối đa boilerplate code. |
| **DB Migration** | **Flyway** (`quarkus-flyway`) | Tự động đồng bộ cấu trúc DB giữa 5 thành viên thông qua các file `.sql` quản lý phiên bản. |
| **Database** | PostgreSQL | Hỗ trợ kiểu dữ liệu UUID mạnh mẽ, toàn vẹn dữ liệu tốt, đánh chỉ mục (Index) hiệu quả. |
| **Authentication** | SmallRye JWT | Xác thực phi trạng thái (Stateless), client tự mang token chứa Identity (`jwt.getSubject()`). |
| **Media Storage** | Cloudinary | Tách biệt lưu trữ file tĩnh khỏi server ứng dụng, CDN tải nhanh, tự động tối ưu ảnh/video. |
| **Realtime Engine** | Quarkus WebSockets Next | Xử lý hàng nghìn kết nối đồng thời với non-blocking I/O. |

---

## 3. Kiến trúc phân tầng (Layered Architecture)

Dự án áp dụng mô hình phân tách tầng nghiêm ngặt (Separation of Concerns):

```text
   [ Client: Web React / Mobile ]
                 │ (HTTP REST / WebSocket)
                 ▼
   ┌─────────────────────────────┐
   │   CORS & Security Filter    │ ──> Cấu hình Origin, kiểm tra Bearer Token / WS Query Token
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │      Controller Layer       │ ──> Jakarta REST (@Path), Validate DTO (@Valid),
   │                             │     đóng gói chuẩn ApiResponse<T>
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │       Service Layer         │ ──> Business Logic, phân quyền sở hữu,
   │                             │     quản lý giao dịch (@Transactional)
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │      Repository Layer       │ ──> PanacheRepositoryBase<T, UUID>,
   │                             │     tối ưu HQL/Panache Query, phân trang
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │      Database (PostgreSQL)  │ ──> Quản lý phiên bản bởi Flyway (src/main/resources/db/migration)
   └─────────────────────────────┘
```

### Trách nhiệm từng tầng:
- **Controller (`alan.nguyen.controller`)**:
  - Tiếp nhận HTTP Request, trích xuất User ID từ `JsonWebToken`.
  - Validate đầu vào bằng `@Valid`.
  - Gọi Service tương ứng và trả về `jakarta.ws.rs.core.Response` bọc `ApiResponse<T>`.
- **Service (`alan.nguyen.service`)**:
  - Chứa toàn bộ business logic và phân quyền (Authorization).
  - **Xác thực quyền**: Kiểm tra người dùng hiện tại có phải tác giả hoặc ADMIN trước khi cập nhật/xóa tài nguyên.
  - Đảm bảo tính toàn vẹn dữ liệu bằng `@Transactional`.
- **Repository (`alan.nguyen.repository`)**:
  - Kế thừa `PanacheRepositoryBase<Entity, UUID>`.
  - Đảm nhiệm việc query, filter, sort và pagination (`PanacheQuery.page()`).
- **DTO Layer (`alan.nguyen.dto`)**:
  - Tách biệt rõ ràng giữa `*RequestDTO` (dữ liệu vào) và `*ResponseDTO` (dữ liệu ra).
  - Ngăn chặn lộ dữ liệu nhạy cảm hoặc lỗi vòng lặp vô hạn (Infinite Recursion) của JPA Lazy Loading.

---

## 4. Phân chia Module & Quy tắc Giao tiếp (Inter-Module Rules)

Hệ thống được chia thành 5 module độc lập tương ứng với 5 thành viên:
1. **Auth & Identity Module**: Đăng ký, đăng nhập, JWT, User Profile.
2. **Post & Media Module**: CRUD Bài viết, Cloudinary Upload, Newsfeed, Timeline.
3. **Interaction & Comment Module**: Like/Reaction, Bình luận bài viết.
4. **Friendship / Social Graph Module**: Kết bạn, hủy kết bạn, lấy danh sách bạn bè.
5. **Realtime Chat Module (Chatify Core)**: Chat 1-1, chat nhóm qua WebSocket, thông báo.

### ⛔ Quy tắc giao tiếp giữa các Module:
- **KHÔNG gọi chéo Repository**: Module Post không được phép Inject `FriendRepository` hay `UserRepository`.
- **Gọi qua Service Interface**: Nếu Module Post cần kiểm tra bạn bè để hiển thị bài viết, nó phải Inject `FriendService`.
- **Giảm thiểu phụ thuộc vòng (Circular Dependency)**: Tránh việc `PostService` Inject `CommentService` và ngược lại.

---

## 5. Các chiến lược kỹ thuật cốt lõi (Core Technical Strategies)

### 5.1. Quản lý Cơ sở dữ liệu với Flyway Migration
- Không phụ thuộc vào `hibernate.hbm2ddl.auto=update` của Hibernate trong môi trường team.
- Tất cả thay đổi cấu trúc DB phải được ghi thành các file SQL Migration tại:
  - `src/main/resources/db/migration/V1.0.0__init_schema.sql`
  - `src/main/resources/db/migration/V1.0.1__add_post_table.sql`
- Mỗi khi tạo/sửa bảng: Bắt buộc tạo file migration mới để 5 người tự động sync DB khi pull code.

### 5.2. Quy trình Upload Media tối ưu (Decoupled File Upload)
- **Bước 1**: Client gửi file trực tiếp qua API `POST /api/v1/files/upload` (tích hợp Cloudinary).
- **Bước 2**: Backend Cloudinary xử lý và trả về `secure_url` + `media_type`.
- **Bước 3**: Client đính kèm URL này vào DTO `CreatePostRequestDTO.mediaUrls` và gọi `POST /api/v1/posts`.
- **Lợi ích**: Tách rời tác vụ I/O nặng khỏi tác vụ lưu dữ liệu DB, tăng tốc phản hồi API.

### 5.3. Xác thực Realtime qua WebSocket
- Do Client không thể đính kèm Header Authorization khi khởi tạo kết nối Handshake WebSocket, hệ thống quy định:
  - Client kết nối bằng URL: `ws://localhost:8080/chat?token=YOUR_JWT_ACCESS_TOKEN`
  - Tầng WebSocket Server (`@OnOpen`) sẽ trích xuất Query Parameter `token`, giải mã validate JWT trước khi chấp nhận (`accept`) session kết nối.

### 5.4. Ma trận Xử lý Lỗi Tập trung (Global Exception Mapping)
Mọi Exception trong ứng dụng sẽ được bắt tự động qua `ExceptionMapper` và trả về dạng `ApiResponse<Void>` chuẩn:

| Exception | HTTP Status Code | Mô tả |
| :--- | :--- | :--- |
| `ConstraintViolationException` | 400 Bad Request | Dữ liệu Request DTO không thỏa mãn `@Valid` |
| `AuthenticationFailedException` | 401 Unauthorized | Token hết hạn hoặc không hợp lệ |
| `ForbiddenException` | 403 Forbidden | Người dùng không có quyền sửa/xóa tài nguyên này |
| `EntityNotFoundException` | 404 Not Found | Không tìm thấy ID Bài viết / Comment / User |
| `Exception` (Default) | 500 Internal Server Error | Lỗi hệ thống chưa xác định |

### 5.5. Chuẩn hóa Phản hồi API (Unified API Response)
Tất cả các API REST tuân theo định dạng JSON duy nhất:
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... }
}
```