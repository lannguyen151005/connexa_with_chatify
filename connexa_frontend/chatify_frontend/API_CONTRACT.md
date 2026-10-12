# API_CONTRACT.md — Hợp đồng Giao tiếp Frontend – Backend

Tài liệu này xác định chi tiết các Endpoint, Cấu trúc DTO (Data Transfer Objects), Cơ chế xác thực, Mã lỗi và Mock Data dùng chung giữa Frontend và Backend trong hệ thống Connexa & Chatify.

> **Quy ước trạng thái:**
> - `[THỰC TẾ]`: Đang hoạt động trên Backend Quarkus (`http://localhost:8080`).
> - `[DỰ KIẾN - CHATBOT]`: Endpoint do bạn phụ trách xây dựng (triển khai qua Next.js Route Handler nội bộ hoặc Backend Quarkus).

---

## 1. Tiêu chuẩn Chung & Xác thực (Authentication)

- **Base URL Backend Quarkus:** `http://localhost:8080`
- **Base URL Next.js Internal API:** `/api`
- **Định dạng dữ liệu:** `Content-Type: application/json; charset=utf-8`
- **Header Xác thực:**
  ```http
  Authorization: Bearer <jwt_token>
  ```
  *(Token được lưu trong `localStorage.getItem('jwt_token')` và tự động đính kèm qua Interceptor tại `app/utils/api.ts`).*

---

## 2. Danh mục API Thực tế Hiện Có (Existing APIs)

### 2.1. Đăng nhập [THỰC TẾ]
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "user123",
    "password": "Password123!"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Đăng nhập thành công"
  }
  ```

### 2.2. Đăng ký [THỰC TẾ]
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "username": "user123",
    "email": "user123@example.com",
    "password": "Password123!"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "message": "Đăng ký thành công"
  }
  ```

### 2.3. Danh sách cuộc hội thoại Chatify [THỰC TẾ]
- **Endpoint:** `GET /api/conversations`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response Success (200 OK):**
  ```json
  [
    {
      "id": "conv-001",
      "name": "Nhóm Đồ Án 5",
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2026-10-12T14:30:00Z",
      "last_message": "Hôm nay họp lúc mấy giờ?"
    }
  ]
  ```

---

## 3. Danh mục API Tính năng Chatbot [DỰ KIẾN - BẠN PHỤ TRÁCH]

### 3.1. Gửi tin nhắn đến Chatbot Trợ lý (Chat Completion)
- **Endpoint:** `POST /api/chatbot/chat`
- **Headers:** `Content-Type: application/json`
- **Mô tả:** Nhận tin nhắn hiện tại kèm theo lịch sử vài lượt hội thoại gần nhất để duy trì ngữ cảnh (context memory). Hỗ trợ Streaming SSE để phản hồi chữ chạy thời gian thực.

#### DTO Request:
```typescript
interface ChatbotRequestDto {
  message: string;                      // Câu hỏi / yêu cầu hiện tại của người dùng
  conversationId?: string;             // Định danh phiên chat (tùy chọn)
  history?: Array<{                    // Lịch sử tin nhắn gần đây để giữ ngữ cảnh
    role: 'user' | 'assistant';
    content: string;
  }>;
  userContext?: {                      // Thông tin bổ sung để cá nhân hóa
    username?: string;
    currentPage?: string;              // Ví dụ: "feed", "create-post"
  };
}
```

#### DTO Response dạng Non-streaming (JSON thường):
```typescript
interface ChatbotResponseDto {
  reply: string;                       // Nội dung phản hồi định dạng Markdown
  conversationId: string;
  suggestions?: string[];              // Danh sách gợi ý tiếp theo (nếu có)
  timestamp: number;
}
```

#### Response dạng Streaming (Server-Sent Events - SSE - Đề xuất):
- **Header:** `Content-Type: text/event-stream`
- **Payload từng chunk:**
  ```
  data: {"chunk": "Chào "}
  data: {"chunk": "bạn! "}
  data: {"chunk": "Dưới đây là 3 gợi ý caption hay:"}
  data: [DONE]
  ```

---

### 3.2. Lấy danh sách câu hỏi gợi ý nhanh (Quick Prompts)
- **Endpoint:** `GET /api/chatbot/prompts`
- **Response Success (200 OK):**
  ```json
  {
    "prompts": [
      {
        "id": "p1",
        "icon": "fas fa-pen-nib",
        "label": "Gợi ý caption đi chơi",
        "text": "Gợi ý cho mình 3 caption thú vị cho ảnh đi cafe cuối tuần nhé"
      },
      {
        "id": "p2",
        "icon": "fas fa-hashtag",
        "label": "Tạo bộ hashtag xu hướng",
        "text": "Gợi ý danh sách hashtag nổi bật cho bài viết về công nghệ và lập trình"
      },
      {
        "id": "p3",
        "icon": "fas fa-shield-halved",
        "label": "Quy chuẩn cộng đồng",
        "text": "Những điều cần lưu ý khi đăng bài trên mạng xã hội Connexa là gì?"
      },
      {
        "id": "p4",
        "icon": "fas fa-user-gear",
        "label": "Hướng dẫn tài khoản",
        "text": "Làm sao để đổi ảnh đại diện và cập nhật thông tin cá nhân?"
      }
    ]
  }
  ```

---

## 4. Bảng Quy chuẩn Mã Lỗi (Error Codes)

| HTTP Status | Mã lỗi nội bộ | Ý nghĩa & Hướng xử lý trên Frontend |
| :--- | :--- | :--- |
| **400 Bad Request** | `INVALID_INPUT` | Nội dung tin nhắn rỗng hoặc vượt quá 2000 ký tự. Hiển thị thông báo trên input. |
| **401 Unauthorized** | `AUTH_EXPIRED` | Token JWT hết hạn hoặc chưa đăng nhập. Điều hướng người dùng về `/login`. |
| **429 Too Many Requests**| `RATE_LIMIT_EXCEEDED` | Người dùng gửi quá nhiều câu hỏi trong thời gian ngắn. Hiển thị cảnh báo vui lòng đợi 30 giây. |
| **500 Internal Error** | `AI_SERVICE_ERROR` | Lỗi khi gọi đến LLM Provider (Gemini/OpenAI). Hiển thị nút *"Thử lại"* (Retry). |
| **504 Gateway Timeout**| `TIMEOUT` | Mô hình AI phản hồi quá lâu (> 15 giây). Báo lỗi mạng và cho phép gửi lại. |

---

## 5. Dữ liệu Giả lập (Mock Data) dùng để Test Frontend độc lập

Trước khi hoàn thiện Backend, Frontend có thể sử dụng Mock Data sau để hoàn thành 100% giao diện:

```typescript
export const MOCK_CHATBOT_REPLIES: Record<string, string> = {
  default: "Xin chào! Mình là **Connexa AI** 🤖. Mình có thể giúp bạn viết caption, gợi ý hashtag thịnh hành, hoặc giải đáp các thắc mắc về mạng xã hội Connexa. Hãy chọn câu hỏi gợi ý bên dưới hoặc nhập câu hỏi nhé!",
  caption: "Dưới đây là 3 gợi ý caption cực chất cho bạn:\n\n1. ☕ *Cà phê một mình không phải cô đơn, mà là tận hưởng bình yên.*\n2. 📸 *Gom một chút nắng ấm cho ngày cuối tuần thêm tươi.*\n3. ✨ *Cuối tuần nạp đầy năng lượng cùng Connexa!*\n\n👉 Bạn hãy copy caption yêu thích để dán vào bài viết nhé!",
  hashtag: "Dưới đây là bộ hashtag chuẩn xu hướng cho bài viết của bạn:\n\n`#Connexa` `#CuocSongMuonMau` `#WeekendVibes` `#ChillTime` `#SongTichCuc`",
  rule: "🛡️ **Tiêu chuẩn cộng đồng Connexa:**\n- Tôn trọng mọi thành viên, không sử dụng ngôn từ kích động thù địch.\n- Không đăng tải nội dung sai sự thật hoặc spam quảng cáo.\n- Bảo vệ thông tin cá nhân và bản quyền nội dung."
};
```
