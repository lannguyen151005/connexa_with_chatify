# AGENTS.md — Quy tắc dành cho AI

**Dự án:** Connexa & Chatify Frontend  
**Phạm vi:** Toàn bộ mã nguồn frontend trong repository này  
**Đối tượng:** Antigravity, GitHub Copilot, Cursor và các AI coding assistant khác

Tài liệu này quy định cách AI cần khảo sát, tạo mới và chỉnh sửa mã nguồn trong dự án. Khi thực hiện một nhiệm vụ, hãy ưu tiên các quy tắc tại đây, những tài liệu liên quan trong repository và các pattern đã được dự án sử dụng. Không tự suy đoán rằng một thư viện, endpoint hay cấu trúc đã tồn tại nếu chưa kiểm tra.

---

## 1. Nguyên tắc làm việc bắt buộc

1. **Đọc trước khi sửa:** Trước khi code, kiểm tra `package.json`, lockfile, `tsconfig.json`, các file liên quan và tài liệu dự án như `DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md`, `API_CONTRACT.md` nếu có.
2. **Ưu tiên thay đổi nhỏ nhất:** Chỉ sửa những file cần thiết để hoàn thành yêu cầu. Không tự ý refactor, đổi tên, di chuyển hoặc xóa code không liên quan.
3. **Tuân theo codebase hiện có:** Ưu tiên pattern đang được dùng và đã hoạt động trong dự án hơn là tự tạo một kiến trúc mới.
4. **Không tự ý thêm dependency:** Không cài, nâng cấp, hạ cấp hoặc gỡ package nếu chưa được yêu cầu. Nếu phát hiện thiếu package hoặc xung đột phiên bản, hãy nêu lý do và đề xuất phương án.
5. **Không bịa thông tin tích hợp:** Không tự tạo endpoint, DTO, field response hoặc hành vi backend rồi coi đó là thực tế. Nếu backend chưa có hợp đồng API, hãy ghi rõ giả định hoặc dùng mock data được cô lập và đánh dấu rõ.
6. **Bảo vệ thay đổi của thành viên khác:** Không ghi đè hoặc xóa thay đổi có sẵn mà không liên quan đến nhiệm vụ. Không tự ý chạy lệnh Git có tính phá hủy như `git reset --hard`, `git clean -fd` hoặc thao tác tương tự.
7. **Báo cáo trung thực:** Chỉ nói đã chạy build, lint, test hoặc xác minh runtime khi thực sự đã chạy. Nếu không thể kiểm tra, hãy ghi rõ giới hạn.

## 2. Tech Stack của dự án

Các công nghệ hiện được khai báo cho dự án:

- **Framework:** Next.js `16.2.6`, App Router
- **Core:** React `19.2.4`, React DOM `19.2.4`, TypeScript `5.x`
- **Styling:** Tailwind CSS `v4.x` thông qua `@tailwindcss/postcss` và `@import "tailwindcss"` trong `globals.css`
- **CSS/UI:** Bootstrap `5.3.0`, React-Bootstrap `2.8.0`
- **Icons:** `@fortawesome/fontawesome-free` `v7.2.0`
- **HTTP client:** Axios `1.16.0`, dùng instance chuẩn tại `app/utils/api.ts`
- **JWT payload:** `jwt-decode` `4.0.0`
- **Realtime chat:** `react-use-websocket`
- **Toast notifications:** `react-hot-toast`
- **Confirmation dialogs:** `sweetalert2`
- **Admin charts:** `recharts`

### Quy tắc xác nhận phiên bản

- `package.json` và lockfile hiện tại là nguồn xác nhận cuối cùng cho dependency và phiên bản thực sự được cài đặt.
- Không tự sửa phiên bản liệt kê trong tài liệu để làm cho nó “mới hơn”. Nếu tài liệu và cấu hình package khác nhau, hãy báo cáo sự khác biệt và ưu tiên cấu hình thực tế của repository.
- Không giả định dự án đang dùng thêm Zustand, Redux Toolkit, TanStack Query, Zod, React Hook Form hoặc thư viện khác nếu chưa thấy trong dependency và codebase.

## 3. Những điều AI tuyệt đối không được tự ý thay đổi

### 3.1. Icon library

- Dùng **Font Awesome Free** đã có trong dự án.
- Không cài thêm `lucide-react`, `react-icons`, Heroicons hoặc thư viện icon khác trừ khi người dùng yêu cầu rõ ràng.
- Khi tạo icon mới, kiểm tra cú pháp và class đang được phiên bản Font Awesome hiện tại hỗ trợ, đồng thời làm theo pattern đã được dùng trong codebase. Không chuyển đổi hàng loạt icon cũ nếu nhiệm vụ không yêu cầu.

### 3.2. Bootstrap và Tailwind CSS

- Dự án sử dụng song song Bootstrap 5 và Tailwind CSS v4. Không gỡ bỏ hoặc thay đổi import Bootstrap hiện có trong `app/layout.tsx` nếu chưa được yêu cầu.
- Không tự ý chuyển toàn bộ giao diện sang một framework CSS khác.
- Khi chỉnh giao diện, kiểm tra khả năng xung đột giữa class Bootstrap và Tailwind. Tái sử dụng pattern hiện có và tránh thêm CSS global nếu chỉ cần style cục bộ.
- Không tạo thêm một hệ thống token hoặc quy chuẩn visual mới ngoài `DESIGN_SYSTEM.md` nếu tài liệu đó đã quy định.

### 3.3. API client dùng chung

- Backend chính là Quarkus; API client chuẩn nằm tại `app/utils/api.ts` và hiện được cấu hình để gửi request tới backend, thường là `http://localhost:8080`.
- Với request tới Backend Quarkus, **phải ưu tiên sử dụng instance `api` từ `app/utils/api.ts`**. Không tự tạo Axios instance mới hoặc tự viết cơ chế gắn token lặp lại.
- Không tự ý sửa base URL, interceptor, cơ chế lấy JWT hoặc xử lý lỗi trong `app/utils/api.ts`.
- Nếu nhiệm vụ thực sự yêu cầu sửa file này, hãy giữ thay đổi tối thiểu, kiểm tra các module bị ảnh hưởng và nêu rõ tác động trong báo cáo. Không tìm cách né file dùng chung bằng cách tạo một client trùng chức năng.
- Dùng đúng alias/import path theo `tsconfig.json` và các import hiện có; không mặc định một đường dẫn alias nếu chưa kiểm tra cấu hình.

### 3.4. Module do thành viên khác phụ trách

Các khu vực cần tránh chỉnh sửa ngoài phạm vi được giao:

- `/chat` — module Chatify
- `/admin` — trang quản trị
- `/login` — luồng đăng nhập
- `/connexa` — Newsfeed Connexa

Không refactor hoặc viết đè logic của những module này chỉ để tích hợp một tính năng mới. Nếu cần thay đổi một điểm tích hợp dùng chung, chỉ sửa phần tối thiểu và ghi rõ các file/module bị ảnh hưởng.

### 3.5. Bí mật và API key

- Không hardcode API key, access token, secret hoặc thông tin xác thực trong mã nguồn.
- Không đặt khóa bí mật của Gemini, OpenAI hoặc nhà cung cấp AI trong biến môi trường có tiền tố `NEXT_PUBLIC_`, vì các biến này có thể được đưa vào bundle phía client.
- Các lời gọi LLM cần bí mật phải đi qua Next.js Route Handler phía server (ví dụ `app/api/chatbot/chat/route.ts`) hoặc backend được phê duyệt.
- Không trả API key hoặc secret về frontend trong response, log hoặc thông báo lỗi.

## 4. Coding standards

### 4.1. Server Components và Client Components

- Với Next.js App Router, ưu tiên **Server Components** theo mặc định.
- Chỉ thêm chỉ thị `"use client";` tại nơi cần tạo ranh giới Client Component để sử dụng state, effects, event handlers hoặc Browser APIs.
- Không thêm `"use client"` máy móc vào mọi component con. Component nằm trong cây Client Component không nhất thiết cần khai báo lặp lại chỉ vì dùng hooks hoặc event handlers.
- Không truy cập `window`, `document` hoặc `localStorage` ở phạm vi module hoặc trong quá trình render có thể chạy phía server. Chỉ truy cập trong ngữ cảnh phía client phù hợp, chẳng hạn event handler hoặc `useEffect`.
- Không biến `app/layout.tsx` thành Client Component chỉ để thêm Chatbot. Ưu tiên tạo component riêng như `ChatbotWidget` với ranh giới client phù hợp, rồi tích hợp vào layout hoặc wrapper hiện có.
- Không truyền các giá trị không thể serialize qua ranh giới Server/Client Components.

### 4.2. TypeScript

- Ưu tiên kiểu dữ liệu cụ thể cho props, API request/response và state.
- Tránh dùng `any`. Khi chưa biết kiểu dữ liệu, ưu tiên `unknown` và thu hẹp kiểu trước khi sử dụng.
- Không lạm dụng `as`, `@ts-ignore` hoặc `@ts-nocheck` để che lỗi kiểu. Nếu buộc phải dùng ngoại lệ, hãy giữ phạm vi nhỏ và giải thích lý do.
- Tái sử dụng type/interface đã có thay vì định nghĩa lại cùng một cấu trúc ở nhiều module.
- Không tự tạo type API khác với DTO/hợp đồng backend đã xác nhận.

### 4.3. Imports và naming

- Thứ tự import ưu tiên: React/Next.js core → thư viện bên ngoài → component nội bộ → hooks/services/utils/API → styles/assets. Giữ theo formatter hoặc pattern hiện có nếu repository đã có quy tắc cụ thể.
- Component React: dùng `PascalCase` cho tên component và file component theo quy ước hiện có.
- Custom hooks: tên bắt đầu bằng `use`, ví dụ `useChatbot.ts`.
- Utility/service: dùng quy tắc đặt tên nhất quán với thư mục hiện tại; không đổi quy tắc đặt tên toàn dự án trong một nhiệm vụ tính năng.
- Ưu tiên tái sử dụng component dùng chung hiện có trước khi tạo component mới.

### 4.4. Tương tác và thông báo

- Dùng `react-hot-toast` cho thông báo nhanh theo pattern hiện có, ví dụ `toast.success(...)` và `toast.error(...)`.
- Dùng `sweetalert2` (`Swal.fire(...)`) cho xác nhận hành động quan trọng hoặc khó hoàn tác, theo quy ước của dự án.
- Không hiển thị đồng thời nhiều thông báo trùng nhau cho cùng một lỗi.
- Thông báo cho người dùng cần dễ hiểu, không để lộ stack trace, secret hoặc thông tin nội bộ.

### 4.5. Responsive và khả năng truy cập

- Giao diện phải hoạt động từ màn hình mobile tới desktop; ưu tiên mobile-first hoặc tuân thủ breakpoint đã được quy định trong `DESIGN_SYSTEM.md`.
- Thành phần tương tác cần có trạng thái focus nhìn thấy được, nhãn phù hợp và có thể dùng bằng bàn phím khi khả thi.
- Không dùng màu sắc đơn lẻ làm dấu hiệu duy nhất cho trạng thái.
- Floating Widget phải tránh che thanh điều hướng chính, nút hành động quan trọng hoặc nội dung cần tương tác trên mobile.

### 4.6. Quản lý lớp giao diện (`z-index`)

- Dùng hệ thống phân cấp lớp giao diện được thống nhất trong `DESIGN_SYSTEM.md` hoặc codebase hiện có.
- Floating Widget cần nổi trên nội dung thông thường nhưng không được tự ý che modal, backdrop hoặc các lớp có mức ưu tiên cao hơn.
- Không mặc định `z-index: 50` luôn cao hơn Bootstrap; không tăng `z-index` tùy tiện để sửa lỗi hiển thị.
- Trước khi chỉnh `z-index`, kiểm tra stacking context, `position`, `transform` và các lớp giao diện liên quan.

## 5. API, xác thực và xử lý dữ liệu

### 5.1. API request và response

- Kiểm tra `API_CONTRACT.md` và code API service hiện tại trước khi tích hợp endpoint.
- Tôn trọng HTTP method, path, request body, query parameters, response DTO và quy ước lỗi đã xác nhận.
- Không giả định mọi response có cùng một cấu trúc nếu backend không quy định như vậy.
- Tách logic gọi API khỏi phần trình bày giao diện theo kiến trúc hiện có.
- Xử lý trạng thái loading, thành công, lỗi và dữ liệu rỗng phù hợp với từng màn hình.
- Nếu backend chưa sẵn sàng, mock data phải được cô lập khỏi code production, có tên hoặc chú thích thể hiện rõ là mock và không được trình bày như dữ liệu API thật.

### 5.2. JWT và phân quyền

- `jwt-decode` chỉ dùng để đọc payload phục vụ UI, ví dụ hiển thị thông tin hoặc điều chỉnh cách trình bày giao diện.
- Không xem `decoded.sub`, `decoded.groups` hoặc dữ liệu decode từ client là bằng chứng xác thực hay phân quyền đáng tin cậy.
- Backend Quarkus chịu trách nhiệm xác minh chữ ký, thời hạn token và quyền truy cập trên API được bảo vệ.
- Không tự ý thay đổi cách lưu token, refresh token hoặc xử lý đăng xuất ngoài phạm vi nhiệm vụ đã giao.
- Không log token hoặc thông tin xác thực ra console.

## 6. Phạm vi tính năng Connexa AI Chatbot

### 6.1. Mục tiêu và vị trí

- **Loại hình:** Social Media Assistant — trợ lý Connexa AI.
- **Giao diện:** Floating Chat Widget ở góc phải bên dưới trên toàn ứng dụng.
- **Module riêng:** Ưu tiên đặt các thành phần chatbot trong `app/components/chatbot/` hoặc vị trí tương ứng theo cấu trúc thực tế của repository.
- **Tích hợp toàn cục:** Tích hợp thông qua `app/layout.tsx` hoặc wrapper phù hợp bằng thay đổi tối thiểu. Không refactor layout hoặc module khác không liên quan.

### 6.2. Lựa chọn backend

- Có thể dùng Next.js Route Handler, ví dụ `app/api/chatbot/chat/route.ts`, hoặc endpoint chatbot của Backend Quarkus theo kiến trúc đã thống nhất.
- Không tự triển khai đồng thời hai đường gọi nếu chưa có yêu cầu.
- Trước khi chọn đường gọi, kiểm tra API hiện có, yêu cầu bảo mật và `API_CONTRACT.md`. Nếu chưa đủ thông tin, ghi rõ giả định thay vì tự xem giả định là thiết kế đã được phê duyệt.
- Khóa bí mật của nhà cung cấp AI chỉ được sử dụng ở server/backend.

### 6.3. Trạng thái giao diện và lỗi

- Xử lý tối thiểu các trạng thái: đang tải, đang gửi, phản hồi thành công, lỗi kết nối và nội dung trống.
- Ngăn gửi lặp ngoài ý muốn trong khi request đang xử lý, nhưng không chặn người dùng sử dụng các chức năng khác của website.
- Không để widget che nội dung quan trọng hoặc làm hỏng bố cục các trang hiện có.
- Không tuyên bố chatbot đã hoạt động với backend/LLM thật nếu mới chỉ triển khai giao diện hoặc mock response.

## 7. Quy trình thực hiện một nhiệm vụ

1. Đọc chỉ dẫn liên quan và kiểm tra các file đang có trước khi đề xuất thay đổi.
2. Xác định phạm vi nhiệm vụ, các component/API dùng chung và module của thành viên khác có thể bị ảnh hưởng.
3. Tái sử dụng component, utility, API client và pattern hiện có; chỉ tạo file mới khi cần thiết.
4. Triển khai thay đổi nhỏ gọn, giữ nguyên hành vi ngoài phạm vi nhiệm vụ.
5. Chạy các lệnh kiểm tra có sẵn và phù hợp trong `package.json` (ví dụ lint, type-check, test hoặc build nếu các script đó tồn tại).
6. Kiểm tra lại diff để phát hiện file ngoài phạm vi bị thay đổi, dependency thay đổi ngoài ý muốn hoặc dữ liệu nhạy cảm bị lộ.
7. Báo cáo kết quả theo mẫu ở mục tiếp theo.

## 8. Báo cáo sau khi code

Sau mỗi nhiệm vụ, báo cáo ngắn gọn:

- **Đã thực hiện:** chức năng hoặc hành vi đã được triển khai.
- **File đã thay đổi:** đường dẫn và mục đích của từng thay đổi quan trọng.
- **Kiểm tra:** các lệnh đã thực sự chạy và kết quả tương ứng.
- **Chưa xác minh / còn hạn chế:** ví dụ backend chưa chạy, endpoint chưa có, chưa kiểm thử trên trình duyệt hoặc còn dùng mock data.
- **Ảnh hưởng tới module khác:** nêu rõ nếu có thay đổi ở layout, API client hoặc component dùng chung.

Không báo cáo “build thành công”, “đã test đầy đủ” hoặc “API hoạt động” nếu chưa có bằng chứng kiểm tra tương ứng.

---

## 9. Tài liệu liên quan

Khi các file sau tồn tại trong repository, hãy đọc và tuân thủ nội dung tương ứng:

- `DESIGN_SYSTEM.md` — design tokens, component UI, responsive và quy tắc visual.
- `FRONTEND_ARCHITECTURE.md` — cấu trúc thư mục, ranh giới module, routing và UI flow.
- `API_CONTRACT.md` — API endpoints, DTO, request/response và xử lý lỗi.

Nếu các tài liệu có mâu thuẫn, không tự âm thầm chọn một quy tắc rồi sửa hàng loạt. Hãy đối chiếu với code/config hiện tại, nêu rõ xung đột và đề xuất cách thống nhất.
