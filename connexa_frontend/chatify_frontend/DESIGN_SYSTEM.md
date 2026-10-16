# DESIGN_SYSTEM.md — Quy chuẩn giao diện Connexa & Chatify

> **Mục đích:** Thống nhất giao diện của Connexa (mạng xã hội), Chatify (nhắn tin) và Connexa AI Chatbot giữa tất cả thành viên, kể cả khi mỗi người sử dụng AI coding assistant khác nhau.
>
> **Nguyên tắc áp dụng:** Đây là quy chuẩn cho UI mới và phần code được chỉnh sửa. Không tự ý refactor hàng loạt giao diện cũ chỉ để khớp tài liệu; nếu cần thay đổi diện rộng, hãy thống nhất với nhóm trước.

---

## 1. Nguyên tắc thiết kế chung

1. Ưu tiên **nhất quán, dễ sử dụng, responsive và dễ bảo trì** hơn hiệu ứng trang trí.
2. Trước khi tạo component mới, kiểm tra component dùng chung và pattern đang có trong codebase.
3. Với UI mới, ưu tiên **Tailwind CSS v4**. Tiếp tục duy trì Bootstrap 5 / React-Bootstrap ở những màn hình hoặc component đang sử dụng chúng; không gỡ Bootstrap và không trộn hai hệ thống class một cách tùy tiện trên cùng một component.
4. Không tự đặt màu, font, khoảng cách, bo góc hoặc `z-index` mới nếu đã có token/quy ước tương ứng trong tài liệu này.
5. Không thay đổi dependency, font, thư viện icon hoặc cấu hình CSS toàn cục chỉ để hoàn thành một component đơn lẻ nếu chưa có lý do rõ ràng.
6. Tất cả trang phải có trạng thái phù hợp cho **loading, lỗi, dữ liệu rỗng, disabled và thao tác thành công** khi các trạng thái đó có thể xảy ra.

## 2. Color Palette — Bảng màu chuẩn

### 2.1. Màu thương hiệu và hành động

| Vai trò | Giá trị | Class sau khi khai báo token | Quy tắc sử dụng |
|---|---|---|---|
| Brand Sky | `#3BBDF7` | `bg-brand` | Điểm nhấn thương hiệu, nền khu vực nhận diện, highlight. Dùng chữ tối trên nền này; **không dùng chữ trắng cho nội dung thường** vì độ tương phản thấp. |
| Primary Action | `#0369A1` | `bg-primary text-white` | Nút hành động chính, tin nhắn người dùng, liên kết hoặc trạng thái được chọn cần nổi bật. |
| Primary Hover | `#075985` | `hover:bg-primary-hover` | Hover/active cho nút primary. |
| Brand Soft | `#E0F2FE` hoặc Tailwind `sky-100` | `bg-sky-100` | Nền phụ, vùng được chọn nhẹ, chip hoặc điểm nhấn không mang tính cảnh báo. |
| Accent Orange | `#C2410C` | `bg-accent text-white` | Badge hoặc thông báo cần gây chú ý. Với nền cam nhạt, dùng chữ tối như `text-orange-900`. |
| AI Gradient Start | `#0369A1` | `from-ai-start` | Đầu gradient của Connexa AI. |
| AI Gradient End | `#4F46E5` | `to-ai-end` | Cuối gradient của Connexa AI. |

**Lưu ý về độ tương phản:** Brand Sky `#3BBDF7` chỉ đạt khoảng `2.14:1` khi đặt chữ trắng lên nền, thấp hơn mức khuyến nghị cho văn bản thông thường. Dùng `text-ink` trên `bg-brand`. Nút primary dùng `#0369A1` với chữ trắng (tương phản khoảng `5.93:1`) để dễ đọc hơn.

### 2.2. Màu nền, nội dung và đường viền

| Vai trò | Giá trị | Class sau khi khai báo token | Quy tắc sử dụng |
|---|---|---|---|
| Page Background | `#F4F6F8` | `bg-page` | Nền chung cho newsfeed, danh sách và trang nội dung. |
| Surface / Card | `#FFFFFF` | `bg-surface` hoặc `bg-white` | Card bài viết, panel, modal và khung chat. |
| Primary Text | `#111827` | `text-ink` | Tiêu đề, nội dung chính và nội dung tin nhắn. |
| Secondary Text | `#4B5563` | `text-ink-muted` | Mô tả, thời gian, thông tin phụ cần đọc được. |
| Border | `#E5E7EB` | `border-border` | Viền card, input và phân cách chính. |
| Subtle Border | `#F3F4F6` | `border-border-subtle` | Phân cách nhẹ trong danh sách hoặc khu vực ít nhấn mạnh. |

Không dùng `text-gray-400` cho nội dung quan trọng hoặc đoạn văn dài. Chỉ dùng màu nhạt như vậy cho chi tiết trang trí không thiết yếu.

### 2.3. Màu trạng thái hệ thống

| Trạng thái | Token | Cách sử dụng |
|---|---|---|
| Success / Online | `#047857` (`text-success`, `bg-success`) | Trạng thái thành công hoặc thành phần có nền xanh đậm và chữ trắng. Với nền nhạt, dùng `bg-success-soft text-success`. |
| Warning | `#92400E` (`text-warning`) | Chữ/cảnh báo màu hổ phách trên nền nhạt `bg-warning-soft`. Tránh dùng màu vàng sáng với chữ trắng. |
| Danger / Error | `#B91C1C` (`text-danger`, `bg-danger`) | Lỗi, hủy hoặc hành động nguy hiểm. Với nền nhạt, dùng `bg-danger-soft text-danger`. |
| Accent | `#C2410C` (`text-accent`, `bg-accent`) | Badge hoặc điểm nhấn cam; không dùng cam sáng với chữ trắng nếu độ tương phản không đủ. |

Màu sắc không được là dấu hiệu duy nhất để truyền đạt trạng thái. Khi cần, phải bổ sung nhãn, icon có tên truy cập được hoặc thông báo bằng văn bản.

### 2.4. Khai báo token Tailwind CSS v4

Nếu các token này chưa tồn tại, nhóm thống nhất khai báo chúng **một lần** trong `app/globals.css` (hoặc file CSS toàn cục hiện tại) bên trong block `@theme` đang có. Không tạo thêm block trùng lặp hoặc xóa `@import "tailwindcss";` hiện tại.

```css
@import "tailwindcss";

@theme {
  --color-brand: #3bbdf7;
  --color-primary: #0369a1;
  --color-primary-hover: #075985;
  --color-page: #f4f6f8;
  --color-surface: #ffffff;
  --color-ink: #111827;
  --color-ink-muted: #4b5563;
  --color-border: #e5e7eb;
  --color-border-subtle: #f3f4f6;
  --color-success: #047857;
  --color-success-soft: #ecfdf5;
  --color-warning: #92400e;
  --color-warning-soft: #fffbeb;
  --color-danger: #b91c1c;
  --color-danger-soft: #fef2f2;
  --color-accent: #c2410c;
  --color-accent-soft: #fff7ed;
  --color-ai-start: #0369a1;
  --color-ai-end: #4f46e5;
}
```

Chỉ sử dụng các class token như `bg-primary`, `text-ink` hoặc `border-border` sau khi token tương ứng đã được khai báo và build xác nhận hoạt động. Trong thời gian chưa tích hợp token, dùng class Tailwind có sẵn hoặc giá trị màu đã thống nhất trong bảng trên; không tự nghĩ ra tên token.

## 3. Typography — Kiểu chữ

### 3.1. Font family

- Font chính: **Geist Sans**, nếu đã được cấu hình trong `app/layout.tsx` hoặc lớp CSS toàn cục.
- Font dự phòng: `Arial, Helvetica, sans-serif`.
- Font monospace: **Geist Mono** cho code snippet do Chatbot hiển thị, nếu font này đã được cấu hình.
- Không import hoặc khai báo một bản font khác bên trong từng page/component. Việc cấu hình font toàn cục chỉ được thực hiện ở một nơi.

### 3.2. Thang chữ

| Thành phần | Quy chuẩn gợi ý | Ghi chú |
|---|---|---|
| Page title / H1 | `text-2xl md:text-3xl font-bold` | Tiêu đề trang; không cần dùng `font-black` ở mọi nơi. |
| Section title / H2 | `text-lg font-semibold` | Tiêu đề card, modal hoặc nhóm nội dung. |
| Subheading / H3 | `text-base font-semibold` | Tiêu đề cấp nhỏ. |
| Body / Post / Chat | `text-sm leading-6` | Mặc định cho newsfeed, bình luận và tin nhắn có mật độ nội dung cao. |
| Form content | `text-sm` hoặc `text-base` | Ưu tiên dễ đọc, nhất quán trong toàn bộ form. |
| Label | `text-sm font-medium` | Luôn có nhãn dễ hiểu cho input. |
| Caption / Timestamp | `text-xs leading-5 text-ink-muted` | Thời gian, trạng thái và mô tả phụ. |
| Code block | `font-mono text-sm` | Cho code hoặc nội dung định dạng monospace. |

Không đặt font-size tùy ý cho từng component khi đã có cấp chữ tương ứng. Với nội dung dài, ưu tiên line-height dễ đọc và tránh các khối chữ quá dày.

## 4. Layout, Container và Spacing

### 4.1. Container trang

- Container nội dung lớn: `w-full max-w-7xl mx-auto px-4 md:px-6`.
- Padding dọc thường dùng: `py-4 md:py-6`.
- Dùng spacing theo thang Tailwind có sẵn, ưu tiên các mức `1`, `2`, `3`, `4`, `6`, `8` thay vì liên tục tạo giá trị tùy chỉnh.
- Dùng `min-w-0` cho cột có nội dung dài, danh sách tin nhắn hoặc phần feed để tránh tràn ngang.
- Không đặt chiều rộng cố định cho toàn trang nếu bố cục có thể co giãn theo viewport.

### 4.2. Bố cục newsfeed ba cột

Dùng grid 12 cột ở màn hình lớn. Không sử dụng `col-span-*` nếu phần tử cha chưa có `display: grid`.

- Wrapper: `grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6`.
- Sidebar trái: `hidden lg:block lg:col-span-3`.
- Feed giữa: `min-w-0 lg:col-span-9 xl:col-span-6`.
- Sidebar phải: `hidden xl:block xl:col-span-3`.

Cách này giữ feed rộng trên laptop nhỏ; ở màn hình rộng hơn, bố cục chuyển thành ba cột `3 / 6 / 3`. Trên mobile, ưu tiên nội dung chính và không tạo khoảng trống cho các sidebar đang ẩn.

Tailwind sử dụng breakpoint mobile-first. Kiểm tra tối thiểu ở các độ rộng gần `375px`, `768px`, `1024px` và `1280px`; các breakpoint mặc định của Tailwind có thể khác nếu codebase đã tùy chỉnh.

### 4.3. Border radius và shadow

| Thành phần | Quy chuẩn |
|---|---|
| Button chính | `rounded-lg` hoặc `rounded-full` nếu là pill button đã thống nhất. |
| Input | `rounded-lg`; chỉ dùng `rounded-full` cho search/chat input có chủ ý thiết kế. |
| Card / Panel | `rounded-2xl border border-border shadow-sm`. |
| Modal / Chat window | `rounded-2xl shadow-xl`, có giới hạn chiều cao và xử lý overflow. |
| Floating Chatbot button | `rounded-full shadow-xl`. |
| Header | Ưu tiên `border-b border-border` hoặc shadow nhẹ; tránh shadow đậm không cần thiết. |

Không dùng `shadow-2xl` cho mọi thành phần. Shadow mạnh chỉ dành cho overlay/floating element thực sự cần tách khỏi nền.

## 5. Quy chuẩn component dùng chung

### 5.1. Button

- Ưu tiên một component Button dùng chung nếu dự án đã có; không tự tạo biến thể khác tên nhưng cùng chức năng.
- Các biến thể cơ bản: `primary`, `secondary`, `outline`, `ghost`, `danger`.
- Các kích thước gợi ý: `sm` (cao khoảng 32px), `md` (40px), `lg` (44–48px). Điều chỉnh dựa theo component thực tế nhưng phải thống nhất.
- Nút primary: `bg-primary text-white hover:bg-primary-hover`.
- Nút cần viền: `border border-border bg-surface text-ink`.
- Nút icon-only phải có `aria-label` mô tả hành động.
- Thể hiện rõ trạng thái `hover`, `focus-visible`, `active` và `disabled`; không chỉ đổi màu rất nhẹ để biểu thị trạng thái.

### 5.2. Input và Form

- Input mặc định: nền trắng, chữ `text-ink`, viền `border-border`, bo góc `rounded-lg`.
- Có trạng thái focus dễ nhận biết, ví dụ `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- Có label; placeholder chỉ là gợi ý, không thay thế label.
- Lỗi validation phải đi kèm thông báo chữ và liên kết với trường tương ứng khi phù hợp.
- Không xóa outline/focus indicator nếu không có cách thay thế dễ nhận thấy.

### 5.3. Card và Surface

- Card nội dung phổ thông: `bg-surface border border-border rounded-2xl shadow-sm`.
- Dùng padding nhất quán, thường `p-4` hoặc `p-5`; không dùng nhiều mức padding gần nhau trong cùng một nhóm card nếu không có lý do.
- Card có thể chứa nút hoặc menu, nhưng phải phân biệt rõ thao tác bấm card với thao tác bấm vào thành phần con.

### 5.4. Avatar và trạng thái online

- Avatar tròn: `rounded-full object-cover border border-border`.
- Kích thước gợi ý:
  - Nhỏ, tin nhắn/bình luận: `h-8 w-8`.
  - Vừa, header/post card: `h-9 w-9` hoặc `h-10 w-10`.
  - Lớn, profile: `h-16 w-16` hoặc `h-20 w-20`.
- Nếu có trạng thái online, dùng chấm màu xanh lá đủ tương phản, có viền trắng và vị trí nhất quán. Trạng thái online không được chỉ thể hiện bằng màu nếu người dùng cần biết chính xác trạng thái.
- Xử lý ảnh lỗi hoặc ảnh đại diện chưa có bằng placeholder nhất quán; không để ảnh vỡ.

### 5.5. Toast, confirmation và feedback

- Thông báo nhanh dùng `react-hot-toast` theo `AGENTS.md`.
- Hộp thoại xác nhận hành động nguy hiểm dùng `sweetalert2` theo `AGENTS.md`.
- Không tạo thêm một cơ chế toast/modal mới nếu thư viện hiện tại đã đáp ứng.
- Nội dung thông báo phải ngắn, dễ hiểu và chỉ báo thành công khi thao tác thực sự hoàn tất.

## 6. Iconography — Font Awesome

- Thư viện icon duy nhất: `@fortawesome/fontawesome-free` theo dependency hiện tại của dự án.
- Không cài thêm `lucide-react`, `react-icons`, Heroicons hoặc thư viện icon khác nếu chưa được nhóm yêu cầu.
- Với icon mới, dùng cú pháp phù hợp với Font Awesome 7, ví dụ:

```tsx
<i className="fa-classic fa-solid fa-house" aria-hidden="true" />
<i className="fa-classic fa-solid fa-magnifying-glass" aria-hidden="true" />
<i className="fa-classic fa-solid fa-bell" aria-hidden="true" />
<i className="fa-classic fa-solid fa-comments" aria-hidden="true" />
<i className="fa-classic fa-solid fa-users" aria-hidden="true" />
<i className="fa-classic fa-solid fa-robot" aria-hidden="true" />
<i className="fa-classic fa-solid fa-paper-plane" aria-hidden="true" />
<i className="fa-classic fa-solid fa-rotate-right" aria-hidden="true" />
<i className="fa-classic fa-solid fa-xmark" aria-hidden="true" />
<i className="fa-classic fa-solid fa-copy" aria-hidden="true" />
```

- Cú pháp trên áp dụng cho icon mới; không chuyển đổi hàng loạt icon cũ đang hoạt động chỉ để đổi cú pháp. Khi sửa icon cũ, xác nhận tên icon và class có trong bộ CSS Font Awesome đang cài.
- Với icon-only button, thêm `aria-label` ở button; icon trang trí dùng `aria-hidden="true"`.

## 7. Chatify — Quy chuẩn chat message

### 7.1. Bubble tin nhắn

- **Tin nhắn người dùng hiện tại:** `bg-primary text-white rounded-2xl rounded-tr-sm ml-auto`.
- **Tin nhắn đối phương hoặc phản hồi AI:** `bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm mr-auto`.
- Giới hạn chiều rộng bubble để tránh một tin nhắn chiếm toàn bộ màn hình; cho phép xuống dòng với URL hoặc nội dung dài.
- Nội dung, thời gian và trạng thái gửi phải có cấp độ thị giác rõ ràng; timestamp không được nổi hơn nội dung chính.
- Không dùng `bg-brand text-white` cho bubble vì độ tương phản văn bản không đủ.

### 7.2. Composer / ô nhập chat

- Input, nút gửi, upload và nút đính kèm phải có vùng tương tác đủ lớn, nhãn truy cập được và trạng thái disabled rõ ràng.
- Không để nút gửi che nội dung nhập hoặc bị đẩy khỏi màn hình khi bàn phím mobile xuất hiện.
- Tin nhắn dài, code block và liên kết cần wrap hoặc scroll trong vùng phù hợp; không làm tràn layout.

## 8. Connexa AI — Quick Prompts và Floating Chatbot

### 8.1. Quick Prompt Chips

- Hình dạng pill: `rounded-full`.
- Nền/viền: `bg-sky-50 border border-sky-200 text-sky-800`.
- Hover: `hover:bg-sky-100`; chuyển động nhẹ và không gây xáo trộn bố cục.
- Phải có trạng thái `focus-visible`; không chỉ có hover vì thiết bị cảm ứng không có hover theo cách của desktop.

### 8.2. Floating Action Button (FAB)

- Kích thước: khoảng `h-14 w-14`, `rounded-full`.
- Nền gợi ý: `bg-gradient-to-tr from-ai-start to-ai-end text-white shadow-xl`.
- Hover/active có thể dùng scale nhẹ; tránh chuyển động quá mạnh hoặc liên tục.
- Trên mobile, đặt button ở vị trí không che thanh điều hướng dưới cùng hoặc nút hành động quan trọng. Ví dụ `right-4 bottom-20 md:right-6 md:bottom-6` nếu ứng dụng có bottom navigation; nếu không có, điều chỉnh theo layout thực tế.
- Nút cần `aria-label="Mở Connexa AI"` (hoặc nhãn tương đương) và trạng thái mở/đóng cần được công bố phù hợp cho công nghệ hỗ trợ.

### 8.3. Chatbot window

- Desktop: có chiều rộng cố định hợp lý, ví dụ `w-80 sm:w-96`, nhưng phải có `max-w` theo viewport.
- Chiều cao giới hạn theo màn hình, ví dụ `max-h-[calc(100dvh-6rem)]`; nội dung hội thoại scroll bên trong, không làm trang chính bị tràn.
- Gradient AI chỉ dùng cho khu vực thương hiệu/nút phù hợp; nội dung dài vẫn phải đặt trên nền có tương phản tốt.
- Không che modal, offcanvas, confirmation dialog hoặc thao tác quan trọng của trang.
- Tạo component Chatbot tách biệt; không đưa toàn bộ logic chatbot vào root layout.

### 8.4. Z-index và lớp phủ

Bootstrap 5.3 dùng các tầng cao cho fixed navbar và overlay như offcanvas, modal, tooltip và toast. Vì vậy, không coi `z-50` của Tailwind là luôn cao hơn Bootstrap.

- Dùng một quy ước tầng lớp duy nhất; tránh tự tăng `z-index` rải rác.
- Floating Chatbot cần nằm trên nội dung thông thường nhưng dưới backdrop/modal/offcanvas và các overlay ưu tiên cao hơn.
- Nếu chưa có token `z-index` riêng, có thể bắt đầu kiểm thử với `z-[1035]` cho widget, nằm trên lớp fixed thông thường nhưng dưới lớp overlay Bootstrap bắt đầu từ khoảng `1040`. Giá trị này phải được xác minh trong layout thực tế.
- Đặt widget gần root layout để tránh ancestor có `transform`, `filter`, `isolation` hoặc stacking context không mong muốn làm thay đổi cách xếp lớp.
- Không sửa z-index của Bootstrap toàn cục để giải quyết một vấn đề riêng của chatbot.

## 9. Responsive và Accessibility

1. Thiết kế mobile-first; kiểm tra các màn hình nhỏ, tablet, laptop và desktop rộng.
2. Tránh horizontal overflow; bảng, code block, danh sách chat và nội dung dài phải có cách hiển thị phù hợp.
3. Các thao tác chính phải sử dụng được bằng bàn phím; focus indicator phải rõ ràng.
4. Nút icon-only cần `aria-label`; ảnh mang thông tin cần `alt` phù hợp, ảnh trang trí dùng alt rỗng khi phù hợp.
5. Không chỉ dựa vào màu để phân biệt success/error, unread/read hoặc online/offline.
6. Giữ tương phản văn bản dễ đọc: mục tiêu thông thường là tối thiểu `4.5:1` cho chữ thường và `3:1` cho chữ lớn; kiểm tra tương phản của icon/đường viền khi chúng cần thiết để nhận biết điều khiển.
7. Vùng chạm trên mobile nên khoảng `44 × 44px` khi có thể, nhất là nút gửi, đóng, menu và FAB.
8. Tôn trọng `prefers-reduced-motion`; animation chỉ bổ trợ phản hồi, không được làm chậm thao tác hay gây khó chịu.

## 10. Quy tắc triển khai cho thành viên và AI

- Đọc tài liệu này cùng `AGENTS.md` và cấu trúc component đang có trước khi code.
- Dùng token và component đã có thay vì chép lại màu hoặc style ở từng page.
- Không tự thêm màu, font, icon library, component library hoặc global CSS reset mới nếu chưa được nhóm thống nhất.
- Tránh inline style cho những gì Tailwind/token hiện tại xử lý được; nếu phải dùng CSS riêng, chỉ rõ lý do và giới hạn phạm vi.
- Trước khi kết thúc nhiệm vụ, kiểm tra ít nhất: giao diện ở viewport chính, trạng thái loading/error/empty nếu có, lỗi console liên quan và việc layout có bị tràn hay chồng lớp không.
- Khi không thể tuân thủ một quy tắc do giới hạn kỹ thuật, hãy nêu rõ giới hạn và phương án được chọn trong báo cáo thay vì tự âm thầm đổi tiêu chuẩn.

## 11. Tài liệu tham khảo kỹ thuật

- Tailwind CSS — Theme variables: https://tailwindcss.com/docs/adding-custom-styles
- Tailwind CSS — Responsive design: https://tailwindcss.com/docs/responsive-design
- Font Awesome — Upgrade to v7 from older versions: https://docs.fontawesome.com/upgrade/upgrade-from-older-versions
- Bootstrap 5.3 — Z-index layers: https://getbootstrap.com/docs/5.3/layout/z-index/
- Next.js — Font optimization: https://nextjs.org/docs/app/getting-started/fonts