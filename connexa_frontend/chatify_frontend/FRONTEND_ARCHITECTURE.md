# FRONTEND_ARCHITECTURE.md — Cấu trúc và Tổ chức Frontend Connexa & Chatify

> **Mục đích:** Thống nhất cách tổ chức mã nguồn, ranh giới module, quy ước đặt tên, quản lý state, định tuyến và luồng người dùng cho dự án Connexa (mạng xã hội), Chatify (nhắn tin) và Connexa AI Chatbot.
>
> **Đối tượng áp dụng:** Cả 5 thành viên và mọi AI coding assistant làm việc trong repository frontend.
>
> **Nguyên tắc quan trọng:** Đây là cấu trúc định hướng. Trước khi di chuyển hoặc đổi tên file hiện có, hãy kiểm tra codebase và thống nhất với người phụ trách module. Không refactor hàng loạt chỉ để làm cây thư mục giống hệt tài liệu.

---

## 1. Nguyên tắc kiến trúc

1. **Tôn trọng Next.js App Router:** thư mục `app/` tổ chức route; `page.tsx` tạo giao diện cho route, `layout.tsx` cung cấp layout dùng chung, và `route.ts` định nghĩa Route Handler.
2. **Phân tách theo feature:** Connexa, Chatify, Admin và Chatbot phải có ranh giới rõ ràng; tránh đặt toàn bộ logic vào một page hoặc component lớn.
3. **Ưu tiên Server Components:** trong App Router, component là Server Component theo mặc định. Chỉ tạo Client Component ở phần cần state, event handler, lifecycle hooks hoặc browser APIs.
4. **Không nhân bản hạ tầng:** sử dụng HTTP client tại `app/utils/api.ts` cho request đến Backend Quarkus theo quy định trong `AGENTS.md`. Không tạo Axios instance thứ hai nếu không có quyết định kiến trúc được thống nhất.
5. **Backend là nguồn xác thực và phân quyền cuối cùng:** route guard hoặc role check ở frontend chỉ giúp điều hướng và ẩn/hiện UI, không thay thế kiểm tra quyền trên backend.
6. **Tài liệu phải phản ánh code thật:** endpoint, DTO, auth flow, route và dependency phải đối chiếu với repository/API thực tế. Không tự suy đoán khi thông tin chưa rõ.

---

## 2. Cấu trúc thư mục đề xuất

```text
chatify_frontend/
├── app/
│   ├── layout.tsx                     # Root layout: html/body, font, global providers,
│   │                                  # Toaster và Chatbot Widget nếu hiển thị toàn ứng dụng
│   ├── page.tsx                       # Route / — Connexa Newsfeed
│   ├── globals.css                    # Tailwind CSS v4 và CSS toàn cục
│   │
│   ├── login/
│   │   └── page.tsx                   # Đăng nhập / Đăng ký nếu đang dùng chung màn hình
│   │
│   ├── chat/
│   │   ├── page.tsx                   # Route /chat — Chatify Messenger
│   │   └── _components/               # Component chỉ phục vụ Chatify
│   │       ├── ConversationList.tsx
│   │       ├── ChatWindow.tsx
│   │       ├── ChatInput.tsx
│   │       ├── items/
│   │       └── modals/
│   │
│   ├── admin/
│   │   ├── page.tsx                   # Route /admin — khu vực quản trị
│   │   └── _components/               # Component chỉ phục vụ Admin
│   │       ├── DashboardView.tsx
│   │       ├── UserManageView.tsx
│   │       └── RoomManageView.tsx
│   │
│   ├── components/                    # Component dùng chung hoặc được tích hợp toàn ứng dụng
│   │   ├── connexa/                   # Header, Sidebar, CreatePostCard, PostCard...
│   │   └── chatbot/                   # Module Connexa AI
│   │       ├── ChatbotWidget.tsx
│   │       ├── ChatbotWindow.tsx
│   │       ├── ChatbotHeader.tsx
│   │       ├── ChatMessageList.tsx
│   │       ├── ChatMessageItem.tsx
│   │       ├── QuickPromptChips.tsx
│   │       └── ChatInputArea.tsx
│   │
│   ├── api/                           # Next.js Route Handlers (server-side endpoints)
│   │   └── chatbot/
│   │       └── chat/
│   │           └── route.ts            # POST /api/chatbot/chat — gọi AI/stream response
│   │
│   └── utils/
│       ├── api.ts                     # Axios instance dùng chung cho Backend Quarkus
│       └── chatbotHelpers.ts          # Helper thuần hoặc helper dành cho browser theo quy định
│
├── public/                            # Static assets: logo, ảnh mặc định, hình minh họa
├── AGENTS.md                          # Quy tắc dành cho AI coding assistants
├── DESIGN_SYSTEM.md                   # Quy chuẩn giao diện
├── FRONTEND_ARCHITECTURE.md            # Tài liệu kiến trúc này
├── API_CONTRACT.md                    # Request/response, DTO, auth và lỗi API
├── package.json
├── package-lock.json / pnpm-lock.yaml / yarn.lock
└── .env.example                       # Tên biến môi trường cần thiết, không chứa secret thật
```

### 2.1. Quy tắc đọc cây thư mục

- `app/layout.tsx` là root layout trong cấu trúc đề xuất này. Không đặt root layout bên trong một thư mục giả định như `(core pages)` nếu chưa chủ ý dùng route group.
- Tên thư mục nằm trong ngoặc đơn, ví dụ `(main)`, là **route group**: giúp tổ chức code nhưng không xuất hiện trong URL. Không dùng tên route group để gây hiểu nhầm rằng URL sẽ chứa tên thư mục đó.
- Thư mục bắt đầu bằng `_`, ví dụ `_components`, biểu thị phần triển khai nội bộ không dùng làm route segment. Đây là cách đặt tên tùy chọn nhưng hữu ích để phân biệt page với component nội bộ.
- Thư mục `app/components/connexa/` trong cây trên là nơi gom component được dùng từ nhiều route. Nếu codebase đã có component Connexa nằm tại `app/connexa/components/`, không tự động di chuyển chúng; hãy giữ nguyên trong ngắn hạn hoặc lập kế hoạch di chuyển có review.
- Một thư mục trong `app/` không tự nó tạo ra URL có thể truy cập. Route thường cần `page.tsx` hoặc `route.ts` tại vị trí tương ứng.
- Cây trên là mô hình tổ chức đề xuất, không phải yêu cầu tạo tất cả file ngay. Chỉ tạo file khi tính năng thật sự cần.

Tham khảo: [Next.js — Project Organization](https://nextjs.org/docs/14/app/building-your-application/routing/colocation), [Next.js — Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups).

---

## 3. Quy tắc phân chia module và component

### 3.1. Page / Container / Presentational Component

- **Page (`page.tsx`):** đại diện route; bố trí các phần chính, tiếp nhận params/search params khi cần và kết nối các component cấp cao.
- **Feature component:** xử lý UI và tương tác của một tính năng cụ thể, ví dụ `CreatePostCard`, `ConversationList` hoặc `ChatbotWindow`.
- **Shared UI component:** nút, input, avatar, modal hoặc thành phần dùng ở nhiều module. Ưu tiên tái sử dụng component hiện có.
- **Helper / service:** chứa xử lý dữ liệu, gọi API hoặc logic có thể kiểm thử độc lập; không đặt logic nghiệp vụ dài trong JSX.
- **Custom hook:** đóng gói logic tương tác/state có thể tái sử dụng. Không tạo hook chỉ để bọc một dòng code đơn giản nếu không làm rõ trách nhiệm.

Không bắt buộc mỗi page phải chia thành một container và nhiều presentational components. Chỉ tách khi giúp làm rõ trách nhiệm, dễ kiểm thử hoặc tái sử dụng.

### 3.2. Ranh giới module và quyền sở hữu

| Module | Phạm vi chính | Không tự ý làm |
|---|---|---|
| Connexa | Newsfeed, tạo bài viết, tương tác bài viết, sidebar và thành phần liên quan | Không thay đổi logic chat/admin khi không liên quan trực tiếp |
| Chatify | Danh sách hội thoại, cửa sổ chat, tin nhắn và realtime | Không sửa kiến trúc chatbot hoặc component feed nếu chưa thống nhất |
| Admin | Dashboard, quản lý user/room và biểu đồ | Không thay đổi auth, API client hoặc quyền backend ngoài phạm vi nhiệm vụ |
| Connexa AI Chatbot | Floating widget, cửa sổ hội thoại AI, quick prompts, stream response và helper riêng | Không refactor các module khác; chỉ sửa điểm tích hợp toàn cục với phạm vi tối thiểu |
| Shared / Infrastructure | Root layout, API client, global CSS, auth provider và design tokens | Thay đổi cần được thông báo/review vì có thể ảnh hưởng cả nhóm |

**Lưu ý về tích hợp Chatbot:** Chatbot có thể cô lập component và logic bên trong `app/components/chatbot/`, nhưng không thể độc lập hoàn toàn vì cần được đăng ký tại `app/layout.tsx`. Khi tích hợp, chỉ thay đổi tối thiểu ở root layout và phối hợp với người phụ trách file đó. Không chuyển toàn bộ root layout thành Client Component chỉ để hiển thị chatbot.

### 3.3. Quy tắc đặt tên

- Component React và file component: `PascalCase.tsx`, ví dụ `ChatbotWidget.tsx`, `CreatePostCard.tsx`.
- Page/layout/route handler giữ đúng tên quy ước của Next.js: `page.tsx`, `layout.tsx`, `route.ts`.
- Hook: bắt đầu bằng `use`, theo camelCase, ví dụ `useChatbot.ts` hoặc `useCurrentUser.ts`.
- Helper/service: camelCase, ví dụ `chatbotHelpers.ts`, `postService.ts`.
- Biến và hàm: `camelCase`, ví dụ `isLoading`, `sendMessage`, `handleToggleChat`.
- Component type/interface: `PascalCase`, ví dụ `ChatMessage`, `UserDto`, `ChatbotSession`. Không bắt buộc thêm tiền tố `I` cho interface; nếu codebase hiện tại dùng `IChatMessage`, giữ nhất quán và không đổi tên hàng loạt.
- Hằng số cấp module: `UPPER_SNAKE_CASE` khi phù hợp, ví dụ `DEFAULT_BOT_GREETING`, `QUICK_PROMPT_LIST`.
- Tránh viết tắt khó hiểu và không dùng nhiều tên khác nhau cho cùng một khái niệm trong các module.

---

## 4. Server Components, Client Components và data fetching

### 4.1. Quy tắc Server/Client Component

- Mặc định ưu tiên Server Components trong Next.js App Router.
- Thêm chỉ thị `"use client"` ở đầu file khi component tạo ranh giới cần interactivity như `useState`, `useEffect`, event handler hoặc browser APIs.
- Không thêm `"use client"` máy móc vào mọi component con trong cây đã thuộc Client Component.
- Không truy cập `window`, `document` hoặc `localStorage` ở phạm vi module hay trong render phía server. Đọc/ghi browser storage trong effect hoặc callback phía client.
- Giữ `app/layout.tsx` là Server Component nếu không có lý do kiến trúc thực sự để thay đổi. Có thể import Client Components như `ChatbotWidget` hoặc component Toaster vào root layout.
- Không truyền props không serializable qua ranh giới Server Component → Client Component; kiểm tra quy tắc serialization của React/Next.js.

Tham khảo: [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

### 4.2. Quy tắc gọi API

- Request đến Backend Quarkus phải dùng `api` từ `app/utils/api.ts` theo `AGENTS.md`, trừ khi nhóm đã phê duyệt thay đổi kiến trúc.
- Nếu `api.ts` đọc JWT từ `localStorage`, chỉ gọi instance này trong môi trường client. Không import và chạy nó từ Server Component/Route Handler theo cách khiến code phụ thuộc `window` hoặc `localStorage`.
- Dữ liệu công khai có thể fetch phía server nếu phù hợp với API hiện có; phải chỉ định chính sách cache/revalidation phù hợp và không để dữ liệu riêng tư của người dùng bị cache dùng chung.
- Không tạo hai luồng fetch trùng nhau cho cùng dữ liệu nếu không có mục đích rõ ràng.
- Không tự thêm TanStack Query, Zustand, Redux hoặc thư viện state/data-fetching khác nếu chưa có trong dependency và chưa được nhóm thống nhất.
- Quy ước endpoint, request/response, mã lỗi, DTO và streaming phải được ghi trong `API_CONTRACT.md`.

### 4.3. Loading, error và empty states

- Với trang hoặc khu vực chờ API, thể hiện loading rõ ràng và tránh làm layout nhảy không cần thiết.
- Khi API thất bại, hiển thị thông báo hữu ích và cho phép thử lại nếu phù hợp.
- Khi dữ liệu rỗng, hiển thị empty state có hướng dẫn hoặc hành động tiếp theo; không để một vùng trắng khó hiểu.
- Không hiển thị thông báo thành công trước khi request thực sự thành công.

---

## 5. Quản lý trạng thái (State Management)

### 5.1. Local UI state

- Dùng `useState` cho các trạng thái đơn giản: mở/đóng modal, tab được chọn, input đang nhập, loading hoặc menu.
- Dùng `useReducer` khi nhiều trạng thái có quan hệ và các chuyển trạng thái bắt đầu phức tạp.
- Không đưa state cục bộ của một modal hoặc một component nhỏ vào global state nếu không có nhu cầu chia sẻ thực sự.

### 5.2. Shared / global state

- Tái sử dụng Auth Context/provider hoặc cơ chế global state đang có trong repository.
- Không tạo thêm context/store trùng chức năng với hệ thống hiện tại.
- Chỉ đưa dữ liệu vào global state khi nhiều route hoặc nhiều nhánh component cần cùng đọc/thay đổi nó.
- Server state và dữ liệu lấy từ API phải có chiến lược cập nhật/invalidation rõ ràng; không xem bản sao trong client state là nguồn dữ liệu chính thức.

### 5.3. Trạng thái xác thực

Theo triển khai hiện tại được mô tả trong `AGENTS.md`:

- Axios instance `app/utils/api.ts` đọc token từ `localStorage` với key `jwt_token`; thông tin user có thể sử dụng key `user_id` nếu code hiện tại đang dựa vào nó.
- Không rải chuỗi key hoặc logic đọc token ở nhiều module; sử dụng cơ chế tập trung sẵn có.
- Vì `localStorage` chỉ có ở browser, không dùng giá trị đó trực tiếp trong Server Component để quyết định quyền render.
- Việc đọc hoặc decode các claim như `sub`/`groups` có thể giúp hiển thị thông tin và điều hướng UI, nhưng **không phải bằng chứng xác thực/phân quyền**. Backend Quarkus phải xác minh token và kiểm tra quyền cho mọi endpoint được bảo vệ.
- Không lưu API key, secret hoặc thông tin nhạy cảm trong `localStorage`.
- **Lưu ý bảo mật:** lưu JWT trong `localStorage` có rủi ro bị đánh cắp nếu xảy ra XSS. Không tự ý thay đổi auth flow đang có trong một task giao diện; hãy ghi nhận rủi ro và đề xuất phương án cookie `HttpOnly`/BFF trong một thay đổi kiến trúc riêng để nhóm đánh giá cùng backend.

Tham khảo: [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

### 5.4. State của Chatify realtime

- Dùng `react-use-websocket` cho module Chatify theo dependency đã thống nhất.
- Quản lý kết nối, subscription và cleanup trong phạm vi hook/component phù hợp; không mở nhiều WebSocket giống nhau cho cùng một mục đích nếu không cần thiết.
- Xử lý ít nhất các trạng thái kết nối, reconnect, gửi thất bại và tải tin nhắn.
- Việc gửi tin nhắn qua WebSocket phải theo contract của backend; frontend không được tự tạo payload hoặc tên event chưa được xác nhận.

### 5.5. State và lịch sử Connexa AI Chatbot

- Quản lý `messages` bằng `useState` hoặc `useReducer` trong module chatbot, tùy độ phức tạp.
- Vì Chatbot được tích hợp trong root layout, state của widget có thể tiếp tục tồn tại khi điều hướng giữa các route cùng dùng root layout. Không tạo nhiều bản Chatbot riêng biệt trên từng page.
- Nếu yêu cầu lưu lịch sử bằng `localStorage`, chỉ truy cập sau khi component chạy ở browser; xử lý JSON lỗi hoặc dữ liệu cũ không hợp lệ và giới hạn dung lượng/lịch sử lưu.
- Phân tách key lịch sử theo user/session phù hợp để tránh hiển thị nhầm lịch sử giữa các tài khoản trên cùng trình duyệt. Khi đăng xuất hoặc đổi tài khoản, xóa hoặc ngắt liên kết lịch sử theo chính sách đã thống nhất.
- Chỉ lưu nội dung cần thiết. Không lưu token, API key hoặc thông tin xác thực trong lịch sử chatbot; không coi dữ liệu localStorage là dữ liệu đáng tin cậy.
- Không dùng localStorage để thay thế lịch sử hội thoại phía server nếu sản phẩm sau này cần đồng bộ giữa thiết bị.

---

## 6. Routes, quyền truy cập và UI Flow

### 6.1. Danh mục route dự kiến

| Đường dẫn | Màn hình / loại endpoint | Chính sách UI dự kiến | Quy tắc cần tuân thủ |
|---|---|---|---|
| `/` | Connexa Home Feed | Có thể hiển thị trang công khai; hành động đăng bài/like/comment yêu cầu đăng nhập nếu backend quy định | Xác nhận chính sách feed thực tế với yêu cầu sản phẩm. Không mặc định mọi thao tác đều công khai. |
| `/login` | Đăng nhập / Đăng ký | Dành cho guest; có thể chuyển người đã đăng nhập về `/` nếu đây là UX đã thống nhất | Không giả định đăng nhập thành công trước khi auth API xác nhận. |
| `/chat` | Chatify Messenger | Chỉ người đã xác thực mới được sử dụng | Frontend có thể điều hướng người chưa đăng nhập, nhưng API/WebSocket backend phải xác minh quyền. |
| `/admin` | Khu vực quản trị | Chỉ hiển thị cho tài khoản có quyền Admin | UI role check không thay thế authorization tại backend. Backend phải kiểm tra quyền ở từng API liên quan. |
| `/api/chatbot/chat` | Next.js Route Handler, không phải page UI | Endpoint server-side; quy định guest/authenticated phải được chốt trong `API_CONTRACT.md` | Giữ API key AI ở server; xác thực đầu vào, xử lý lỗi, giới hạn tài nguyên và không trả lộ secret/stack trace. |

Đây là route dự kiến dựa trên phạm vi dự án đã mô tả. Trước khi triển khai route/guard, đối chiếu code hiện tại và yêu cầu sản phẩm. Không tự tạo route mới chỉ vì nó xuất hiện trong bảng.

### 6.2. Quy tắc bảo vệ route

- Phân biệt **điều hướng UI** với **ủy quyền thực sự**.
- Có thể dùng client-side guard để cải thiện UX khi token hiện đang ở `localStorage`, nhưng không dùng nó làm biện pháp bảo mật duy nhất.
- Không dùng `decoded.groups.includes('ADMIN')` làm cách duy nhất để bảo vệ admin. Backend phải xác minh JWT và quyền Admin cho endpoint quản trị.
- Không tin `user_id`, `groups` hoặc các giá trị khác chỉ vì chúng tồn tại trong localStorage hay payload đã decode ở client.
- Nếu nhóm chuyển auth sang cookie `HttpOnly` hoặc server-side session sau này, cập nhật cách kiểm soát route theo kiến trúc mới; không tự trộn hai cơ chế.

### 6.3. Luồng người dùng chính

```text
[Khách truy cập]
       |
       v
[/login] -- xác thực thành công từ backend --> [/]
                                              |
                 +----------------------------+--------------------------+
                 |                            |                          |
                 v                            v                          v
         [Newsfeed Connexa]             [Click Chatify]           [Click AI FAB]
         - Xem bài viết                 - Mở /chat                - Mở popup AI
         - Đăng bài*                    - Tải hội thoại*          - Chọn quick prompt
         - Like/comment*                - Gửi/nhận realtime*      - Nhập câu hỏi
                                                                    - Xem câu trả lời
                                                                    - Copy kết quả

* Các thao tác yêu cầu quyền phải được backend xác minh.
```

### 6.4. Luồng tương tác Chatbot

1. **Mở widget:** Người dùng nhấn FAB; `ChatbotWidget` điều khiển đóng/mở `ChatbotWindow`. Widget chỉ xuất hiện tại các route được xác định trong chính sách hiển thị.
2. **Khởi tạo phiên:** Nếu chưa có lịch sử phù hợp cho user/session hiện tại, hiển thị lời chào mặc định và các quick prompts. Không đọc `localStorage` trong render server.
3. **Gửi câu hỏi:** Người dùng gửi prompt bằng nút gửi hoặc Enter theo quy ước input; Shift+Enter có thể xuống dòng nếu textarea hỗ trợ.
4. **Nhận phản hồi:** Hiển thị trạng thái loading/typing; stream response theo giao thức đã chốt trong `API_CONTRACT.md`. Không tự ý chuyển giữa WebSocket, SSE và Fetch Streaming trong một task UI.
5. **Xử lý lỗi:** Hiển thị lỗi dễ hiểu, cho phép thử lại phù hợp và tránh thêm cùng một user message nhiều lần khi retry.
6. **Copy kết quả:** Mặc định, nút Copy sao chép nội dung phản hồi vào clipboard và thông báo kết quả. Nếu yêu cầu là tự điền nội dung vào `CreatePostCard`, phải triển khai cơ chế handoff được thống nhất giữa hai module; không thao tác trực tiếp DOM hoặc sửa state nội bộ của Connexa từ Chatbot.
7. **Làm mới lịch sử:** Nút reset cần xác nhận nếu hành động xóa không thể hoàn tác, sau đó cập nhật state và storage cùng nhau.
8. **Điều hướng:** Chatbot không được reset chỉ vì chuyển giữa các route dùng chung root layout, trừ khi người dùng chọn reset hoặc chính sách yêu cầu kết thúc phiên.

---

## 7. API Route Handler và cấu hình môi trường

### 7.1. `app/api/chatbot/chat/route.ts`

- Đây là server endpoint của Next.js, không phải API client-side component.
- API key Gemini/OpenAI và các secret khác chỉ được đọc trong môi trường server từ biến môi trường không có tiền tố `NEXT_PUBLIC_`.
- Chỉ nhận các field đã quy định trong `API_CONTRACT.md`; kiểm tra request body và từ chối input không hợp lệ.
- Xử lý lỗi của nhà cung cấp AI mà không trả secret, API key, stack trace hoặc dữ liệu nội bộ cho client.
- Xác định rõ endpoint có yêu cầu đăng nhập không, giới hạn kích thước prompt/lịch sử và chính sách rate limiting. Không coi ẩn nút trên UI là giới hạn truy cập.
- Nếu trả response dạng stream, quy định chính xác format chunk, cách báo lỗi và điều kiện kết thúc stream trong `API_CONTRACT.md`.

### 7.2. Biến môi trường

- Không commit `.env.local` hoặc giá trị secret thật lên Git.
- Có thể duy trì `.env.example` với tên biến và giá trị placeholder an toàn.
- Chỉ đặt biến có thể công khai ở client khi có chủ đích rõ ràng; không đặt API key AI vào `NEXT_PUBLIC_*`.
- Không thêm hoặc đổi tên biến môi trường mà không cập nhật tài liệu và kiểm tra nơi sử dụng.

---

## 8. Hợp đồng giữa các module và tài liệu liên quan

- `AGENTS.md`: quy tắc dành cho AI, cách thực hiện nhiệm vụ và giới hạn chỉnh sửa.
- `DESIGN_SYSTEM.md`: màu sắc, typography, spacing, component UI, responsive và accessibility.
- `API_CONTRACT.md`: endpoint, request/response, DTO, auth, error format, WebSocket events và giao thức stream của chatbot.
- File này: tổ chức mã nguồn, quyền sở hữu module, state management, route và UI flow.

Nếu tài liệu xung đột với implementation đã được nhóm xác nhận, không tự chọn một cách âm thầm. Ghi rõ mâu thuẫn, xác định nguồn chuẩn cùng người phụ trách và cập nhật tài liệu sau khi thống nhất.

---

## 9. Quy trình làm việc khi vibe coding

Trước khi bắt đầu:

1. Đọc `AGENTS.md`, `DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md` và phần API liên quan trong `API_CONTRACT.md`.
2. Kiểm tra file và component hiện có; xác định module, chủ sở hữu và phạm vi file cần chỉnh.
3. Xác định các trạng thái UI cần xử lý: loading, success, empty, error và disabled khi phù hợp.

Trong khi thực hiện:

1. Ưu tiên thay đổi nhỏ, đúng phạm vi task; tái sử dụng component/service có sẵn.
2. Không tự ý refactor file của thành viên khác, API client, auth flow, global CSS hoặc root layout nếu không cần thiết.
3. Nếu bắt buộc phải thay đổi file dùng chung, báo rõ lý do và tác động; tách thay đổi độc lập khi phù hợp.
4. Không ghi đè thay đổi chưa commit của thành viên khác và không tự ý chạy lệnh Git có tính phá hủy.

Sau khi thực hiện:

1. Chạy các lệnh kiểm tra có sẵn trong `package.json` phù hợp với task, ví dụ lint, typecheck hoặc build nếu dự án đã cấu hình.
2. Kiểm tra UI ở kích thước mobile và desktop liên quan đến task.
3. Kiểm tra lỗi console, lỗi import, overflow, z-index, loading/error/empty state và tương tác chính.
4. Báo cáo file đã sửa, hành vi đã hoàn thành, các lệnh đã chạy cùng kết quả thực tế và vấn đề còn tồn tại. Không báo rằng build/test thành công nếu chưa thực sự chạy.

---

## 10. Tài liệu tham khảo

- Next.js — [Project Organization and Colocation](https://nextjs.org/docs/14/app/building-your-application/routing/colocation)
- Next.js — [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- Next.js — [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- Next.js — [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- OWASP — [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
### Quy tắc bảo toàn codebase hiện tại

- Dự án được phát triển tiếp từ ứng dụng Chatify hiện có. Cấu trúc thư mục và cách tổ chức module đang chạy được xem là nền tảng chính thức.
- Không tự ý di chuyển, đổi tên hoặc refactor hàng loạt file cũ chỉ để khớp với cấu trúc kiến trúc đề xuất.
- Khi phát triển tính năng mới, ưu tiên tạo module độc lập và chỉ sửa các điểm tích hợp thực sự cần thiết.
- Không chỉnh sửa logic của Chatify, Connexa, Admin, Login hoặc API client dùng chung ngoài phạm vi nhiệm vụ đã được giao.
- Nếu một tính năng cần thay đổi file dùng chung như `app/layout.tsx`, `app/globals.css` hoặc `app/utils/api.ts`, phải xác định rõ lý do, giữ thay đổi ở mức tối thiểu và báo cáo tác động.
- Cây thư mục trong tài liệu phải phân biệt rõ file hiện có với file mới đề xuất. Không coi file đề xuất là file đã tồn tại trong repository.