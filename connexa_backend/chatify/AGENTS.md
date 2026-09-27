# AGENTS.md - Dự án Mạng xã hội Connexa (Chatify Backend)

Tài liệu này định hướng ngữ cảnh và quy chuẩn lập trình bắt buộc cho AI Agent khi hỗ trợ phát triển dự án Connexa.

---

## 1. Tổng quan dự án (Project Overview)
- **Tên dự án**: Connexa (Backend module: Chatify).
- **Quy mô**: Đồ án môn học / Đồ án tốt nghiệp (Nhóm 5 người).
- **Mục tiêu**: Xây dựng nền tảng mạng xã hội tương tự Facebook (Bài viết, Tương tác, Bình luận, Bạn bè, Nhắn tin thời gian thực).

---

## 2. Công nghệ cốt lõi & Cấm dùng (Tech Stack Rules)

### Stack chuẩn:
- **Ngôn ngữ**: Java 17.
- **Framework**: Quarkus 3.x (Quarkus REST / RESTEasy Reactive, SmallRye OpenAPI).
- **ORM / Database**: Hibernate ORM với **Panache Repository** (`quarkus-hibernate-orm-panache`), PostgreSQL (`quarkus-jdbc-postgresql`).
- **Bảo mật / Auth**: SmallRye JWT (`io.quarkus.security.Authenticated`, `org.eclipse.microprofile.jwt.JsonWebToken`).
- **Cloud / File Upload**: Cloudinary (`cloudinary-http44`).
- **Realtime**: Quarkus WebSockets Next (`quarkus-websockets-next`).
- **Validation**: Jakarta Validation (`quarkus-hibernate-validator`).
- **Boilerplate**: Lombok (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`).

### ⛔ CẤM TUYỆT ĐỐI (Anti-Hallucination Rules):
- **KHÔNG dùng Spring Boot**: Tuyệt đối không import bất kỳ package `org.springframework.*` nào.
- Bảng quy đổi bắt buộc AI phải tuân thủ:
  | Spring Boot (CẤM) | Quarkus (DÙNG CHUẨN) |
  | :--- | :--- |
  | `@RestController`, `@RequestMapping` | `@Path("/...")`, `@Produces(MediaType.APPLICATION_JSON)` |
  | `@Autowired` | `@Inject` (Jakarta CDI) |
  | `@GetMapping`, `@PostMapping` | `@GET`, `@POST`, `@PUT`, `@DELETE` |
  | `JpaRepository<T, ID>` | `PanacheRepositoryBase<T, UUID>` |
  | `ResponseEntity<T>` | `jakarta.ws.rs.core.Response` |

---

## 3. Quy chuẩn Kiến trúc & Cấu trúc Thư mục

Tất cả mã nguồn Java nằm trong package `alan.nguyen.*`:

```text
src/main/java/alan/nguyen/
├── common/          # Enums, Constants, Custom Exceptions, ExceptionMappers, ApiResponse
├── controller/      # Jakarta REST Controllers (@Path)
├── dto/             # Request/Response DTOs (Tách theo module: post, auth, message, ...)
├── entity/          # JPA Entities
├── repository/      # Panache Repositories (implements PanacheRepositoryBase<Entity, UUID>)
├── service/         # Business Logic Interfaces & Implementations (service/impl)
└── websocket/       # Xử lý Realtime với Quarkus WebSockets Next (@WebSocket)
```

### Quy tắc tầng & Luồng dữ liệu:
- **Controller**:
  - Nhận request, validate DTO bằng `@Valid`.
  - Trả về `jakarta.ws.rs.core.Response.ok(ApiResponse.success(data)).build()`.
  - Bảo vệ endpoint bằng `@Authenticated`.
  - Lấy User ID người dùng hiện tại từ JWT: `UUID.fromString(jwt.getSubject())`.
- **Service**:
  - Chứa toàn bộ business logic và phân quyền (Authorization).
  - Sử dụng `@Transactional` (từ `jakarta.transaction.Transactional`) cho các hàm ghi/sửa DB.
- **Repository**:
  - Sử dụng `PanacheRepositoryBase<T, UUID>` (KHÔNG dùng `PanacheEntity` mặc định ID Long).
- **DTO & API Response**:
  - Request DTO phải dùng Annotation Validate (`@NotBlank`, `@NotNull`, `@Size`).
  - Mọi API thành công phải bọc qua class chuẩn `ApiResponse<T>`:
    ```java
    public record ApiResponse<T>(boolean success, String message, T data) {}
    ```

---

## 4. Quy ước Dữ liệu & Coding Rules
- **Khóa chính**: Luôn sử dụng kiểu UUID (`@GeneratedValue(strategy = GenerationType.UUID)`).
- **Thời gian**: Sử dụng `LocalDateTime` cho các trường `created_at`, `updated_at`.
- **Xóa mềm (Soft Delete)**:
  - Các bảng bài viết/bình luận bắt buộc có cờ `boolean is_deleted = false;`.
  - Khi xóa, chỉ cập nhật `is_deleted = true`, KHÔNG dùng `repo.delete()`.
- **Phân trang (Pagination)**:
  - Tất cả API trả về danh sách (Feed, Comments) bắt buộc có phân trang.
  - Sử dụng `PanacheQuery.page(Page.of(pageIndex, pageSize))`.
- **Xác thực quyền sở hữu (Strict Ownership Check)**:
  - Khi Update hoặc Delete tài nguyên (Bài viết, Comment): Bắt buộc so sánh `resource.getAuthor().getId()` với `currentUserId`. Nếu không khớp, throw `ForbiddenException` (403).
- **WebSockets Next Standard**:
  - Dùng `@WebSocket(path = "/chat/{roomId}")`, `@OnOpen`, `@OnTextMessage`, `@OnClose` từ package `io.quarkus.websockets.next.*`.

---

## 5. Lệnh Thực Thi & Prompting Rules cho AI
- **Dev Mode**: `./mvnw quarkus:dev`
- **Build & Check**: `./mvnw clean compile`

### Nguyên tắc khi AI tạo Code:
1. **Chỉ sửa file liên quan**: Không tự ý sửa cấu trúc database hoặc entity khác nếu không được yêu cầu.
2. **Không để code dở dang**: Bắt buộc triển khai đầy đủ logic, không dùng comment `// TODO: implement later`.
3. **Luôn đi kèm DTO**: Khi tạo API mới, phải tạo đủ Request DTO, Response DTO và Mapper tương ứng.