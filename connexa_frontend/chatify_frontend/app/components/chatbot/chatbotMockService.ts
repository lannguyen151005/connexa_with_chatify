/**
 * Mock Service độc lập cho Trợ lý Charles (Connexa AI)
 * Dùng để phát triển và kiểm thử toàn bộ UI/UX mà không phụ thuộc backend
 * Phản hồi bằng định dạng Markdown chuẩn (in đậm, danh sách, backticks)
 */

interface MockResponseRule {
  keywords: string[];
  reply: string;
}

const MOCK_RULES: MockResponseRule[] = [
  {
    keywords: ['cafe', 'cà phê', 'cuối tuần', 'coffee'],
    reply: `Dưới đây là 3 gợi ý caption cafe cuối tuần cực chất cho bạn:

1. ☕ **Nhẹ nhàng & Chill:**
> *"Một tách cà phê ấm, một góc quán quen và một buổi sáng thảnh thơi. Cuối tuần chỉ cần bình yên như vậy là đủ."*

2. ✨ **Năng lượng & Tươi mới:**
> *"Nạp chút caffeine để bắt đầu ngày mới thật rực rỡ! Chúc cả nhà Connexa một ngày ngập tràn niềm vui."*

3. 🌿 **Thả thính dễ thương:**
> *"Cà phê đắng thì thêm đường, còn đời bạn thiếu vị gì thì thêm tôi vào nhé!"*

👉 *Gợi ý: Bạn có thể nhấn nút sao chép (copy) bên dưới để dán trực tiếp vào ô đăng bài Connexa.*`,
  },
  {
    keywords: ['du lịch', 'travel', 'biển', 'sống ảo', 'chuyến đi'],
    reply: `Gợi ý 3 caption du lịch biển vừa sâu lắng vừa hút tương tác:

1. 🌊 **Yêu đời & Tự do:**
> *"Nghe tiếng sóng vỗ, để gió cuốn đi mọi muộn phiền. Biển xanh, cát trắng và những ngày tháng rực rỡ nhất của thanh xuân."*

2. 📸 **Hài hước & Đáng yêu:**
> *"Vitamin Sea đã nạp đầy đủ! Đi đâu không quan trọng, quan trọng là ảnh đăng lên Connexa phải thật lung linh."*

3. 🌅 **Sâu sắc & Chiêm nghiệm:**
> *"Thế giới ngoài kia bao la rộng lớn, mỗi chuyến đi là một lần tìm thấy phiên bản tự do hơn của chính mình."*`,
  },
  {
    keywords: ['hashtag', 'tag', 'thịnh hành', 'xu hướng'],
    reply: `Dưới đây là bộ hashtag chuẩn xu hướng cho bài viết của bạn trên Connexa:

\`#Connexa\` \`#CuocSongMuonMau\` \`#WeekendVibes\` \`#SongTichCuc\` \`#KetNoiMoiNgay\` \`#StoryOfLife\`

💡 **Mẹo:** Đặt từ 3 đến 5 hashtag liên quan nhất ở cuối bài viết sẽ giúp bài đăng tiếp cận đúng bạn bè có cùng sở thích!`,
  },
  {
    keywords: ['tiêu chuẩn', 'cộng đồng', 'quy định', 'luật', 'vi phạm'],
    reply: `🛡️ **Tiêu chuẩn cộng đồng trên Mạng xã hội Connexa:**

Để xây dựng một không gian văn minh, an toàn và tích cực, các thành viên cần lưu ý:
- 🤝 **Tôn trọng lẫn nhau:** Không sử dụng ngôn từ thù địch, quấy rối, xúc phạm danh dự cá nhân.
- 🚫 **Nói không với tin giả:** Không chia sẻ thông tin sai sự thật hoặc nội dung lừa đảo.
- 🔒 **Bảo vệ quyền riêng tư:** Không đăng tải thông tin cá nhân của người khác mà chưa có sự đồng ý.
- 🎨 **Tôn trọng bản quyền:** Ghi rõ nguồn hình ảnh hoặc bài viết nếu trích dẫn từ tác giả khác.`,
  },
  {
    keywords: ['avatar', 'ảnh đại diện', 'đổi ảnh', 'cá nhân', 'profile'],
    reply: `Để cập nhật ảnh đại diện trên Connexa & Chatify, bạn thực hiện theo các bước sau:
1. Vào mục **Chatify** (\`/chat\`) từ thanh menu trên cùng.
2. Nhấn vào biểu tượng thông tin cá nhân ở thanh bên trái.
3. Chọn ảnh mới từ máy tính của bạn và nhấn **Lưu thay đổi**.
Ảnh đại diện mới sẽ được đồng bộ ngay lập tức cho tài khoản của bạn!`,
  },
  {
    keywords: ['chào', 'hello', 'hi', 'bạn là ai', 'charles'],
    reply: `Chào bạn! Tôi là **Trợ lý Charles** 🤖, trợ lý AI đồng hành của mạng xã hội Connexa.

Tôi luôn sẵn sàng giúp bạn:
- Sáng tạo caption bài viết hấp dẫn
- Lựa chọn bộ hashtag phù hợp
- Giải đáp thắc mắc về các tính năng của Connexa

Bạn đang muốn viết bài về chủ đề gì hôm nay? Hãy chia sẻ với tôi nhé!`,
  },
];

const DEFAULT_FALLBACK_REPLY = `Tôi đã nhận được yêu cầu của bạn! 

Là **Trợ lý Charles** của Connexa, tôi gợi ý bạn có thể:
- Bổ sung thêm cảm xúc (vui vẻ, trầm lắng, hài hước) để tôi viết caption sát ý nhất.
- Yêu cầu gợi ý hashtag hoặc câu chúc mừng cụ thể theo sự kiện.

Bạn có muốn tôi thử gợi ý theo phong cách nào không?`;

/**
 * Giả lập quá trình suy nghĩ và sinh phản hồi của AI
 * @param userPrompt Câu hỏi hoặc yêu cầu từ người dùng
 * @param delayMs Thời gian độ trễ giả lập (mặc định 900ms)
 */
export async function mockGenerateReply(userPrompt: string, delayMs = 900): Promise<string> {
  const normalized = userPrompt.toLowerCase().trim();

  // Tìm câu trả lời phù hợp nhất theo từ khóa
  const matchedRule = MOCK_RULES.find((rule) =>
    rule.keywords.some((kw) => normalized.includes(kw))
  );

  const replyText = matchedRule ? matchedRule.reply : DEFAULT_FALLBACK_REPLY;

  // Giả lập độ trễ mạng tự nhiên
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(replyText);
    }, delayMs);
  });
}
