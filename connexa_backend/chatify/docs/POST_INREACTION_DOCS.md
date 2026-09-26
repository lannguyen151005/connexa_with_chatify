# 🚀 Tài liệu Kỹ thuật: Tính năng Tương tác Bài viết (Post Interaction) - Chatify

Tài liệu này tổng hợp toàn bộ thiết kế cơ sở dữ liệu, kiến trúc mã nguồn và danh sách API cho tính năng **Tương tác bài viết (Reaction & Comment)** trong dự án mạng xã hội **Chatify**.

---

## 🛠️ 1. Công nghệ Sử dụng & Chuẩn thiết kế

* **Framework:** Java 17, Quarkus 3.34.3
* **ORM / Database Access:** Hibernate ORM Panache, PostgreSQL
* **Bảo mật & Xác thực:** SmallRye JWT (`@Authenticated`, `JsonWebToken`)
* **Thư viện bổ trợ:** Lombok, Bean Validation (`jakarta.validation`)
* **Định dạng Phản hồi:** `ApiResponse<T>` đồng bộ với chuẩn chung dự án.

---

## 🗄️ 2. Thiết kế Cơ sở Dữ liệu (Database Schema)

### 2.1. Bảng `post_reactions` (Biểu cảm bài viết)
* Giới hạn mỗi người dùng chỉ tương tác 1 biểu cảm/bài viết (`UNIQUE(post_id, user_id)`).

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Khóa chính |
| `post_id` | `UUID` (FK) | Mã bài viết được thả biểu cảm |
| `user_id` | `UUID` (FK) | Mã người dùng thực hiện tương tác |
| `type` | `VARCHAR(20)` | Loại biểu cảm (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`) |
| `created_at` | `TIMESTAMP` | Thời điểm tạo |

### 2.2. Bảng `post_comments` (Bình luận bài viết)
* Hỗ trợ bình luận gốc và trả lời bình luận (Reply comment thông qua `parent_id`).
* Áp dụng cơ chế **Xóa mềm (Soft Delete)** qua `is_deleted`.

| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Khóa chính |
| `post_id` | `UUID` (FK) | Mã bài viết |
| `user_id` | `UUID` (FK) | Mã tác giả bình luận |
| `content` | `TEXT` | Nội dung bình luận |
| `parent_id` | `UUID` (FK, Nullable) | Mã bình luận cấp cha (nếu là reply) |
| `is_deleted` | `BOOLEAN` | Trạng thái xóa mềm (`true`/`false`) |
| `created_at` | `TIMESTAMP` | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Thời điểm cập nhật cuối cùng |

---

## 📂 3. Cấu trúc Mã nguồn (Project Structure)

```text
src/main/java/alan/nguyen/
├── common/
│   └── ReactionType.java                # Enum danh sách biểu cảm
├── entity/
│   ├── PostReaction.java                # Entity Bảng post_reactions
│   └── PostComment.java                 # Entity Bảng post_comments
├── dto/interaction/
│   ├── ReactionRequestDTO.java          # Body Request thả biểu cảm
│   ├── CreateCommentRequestDTO.java     # Body Request tạo bình luận
│   └── CommentResponseDTO.java          # Response DTO thông tin bình luận
├── repository/
│   ├── PostReactionRepo.java            # Repository truy vấn Reaction
│   └── PostCommentRepo.java             # Repository truy vấn Comment
├── service/
│   ├── PostInteractionService.java      # Interface xử lý nghiệp vụ
│   └── impl/
│       └── PostInteractionServiceImpl.java # Implementation xử lý logic
└── controller/
    └── PostInteractionController.java  # REST Endpoints (/api/v1/posts)