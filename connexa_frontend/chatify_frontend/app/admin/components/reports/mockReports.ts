import { AdminReport, DismissReportPayload, PaginatedReportsResponse, ReportFilterParams, ResolveReportPayload } from './types';
import { mockSoftDeletePost } from '../posts/mockPosts';

export let MOCK_REPORTS_DATABASE: AdminReport[] = [
  {
    id: "rep-001",
    reporter: {
      id: "usr-02",
      username: "thao_nguyen",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp",
    },
    targetType: "POST",
    targetId: "post-103",
    targetSummary: "💥 CƠ HỘI ĐẦU TƯ LỢI NHUẬN 300% MỖI NGÀY! Inbox ngay số Zalo 0988xxxxxx...",
    targetAuthor: {
      id: "usr-03",
      username: "tai_khoan_spam",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp",
    },
    reason: "SPAM",
    reasonText: "Spam / Quảng cáo lừa đảo",
    details: "Tài khoản này liên tục đăng bài rủ rê nạp tiền đầu tư vào nhóm Zalo lừa đảo tài chính.",
    createdAt: "2026-10-18T08:15:00Z",
    status: "PENDING",
  },
  {
    id: "rep-002",
    reporter: {
      id: "usr-04",
      username: "hoang_minh_tech",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
    },
    targetType: "POST",
    targetId: "post-105",
    targetSummary: "Thanh lý vé concert Blackpink giá sốc chỉ 500k/vé, chuyển khoản trước giữ chỗ ngay...",
    targetAuthor: {
      id: "usr-05",
      username: "nghi_van_lua_dao",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp",
    },
    reason: "SCAM",
    reasonText: "Lừa đảo / Bán hàng giả",
    details: "Vé concert đã bán hết từ lâu nhưng tài khoản này đòi chuyển cọc trước, có dấu hiệu quỵt tiền.",
    createdAt: "2026-10-18T07:45:00Z",
    status: "PENDING",
  },
  {
    id: "rep-003",
    reporter: {
      id: "usr-06",
      username: "lan_anh_design",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp",
    },
    targetType: "COMMENT",
    targetId: "cmt-501",
    targetSummary: "Nội dung bình luận: 'Làm giao diện nhìn như rác rưởi, đúng là thứ bất tài vô dụng...'",
    targetAuthor: {
      id: "usr-08",
      username: "tai_khoan_gay_roi",
      avatarUrl: null,
    },
    reason: "HARASSMENT",
    reasonText: "Quấy rối / Công kích cá nhân",
    details: "Bình luận lặp đi lặp lại mang tính xúc phạm danh dự và công kích cá nhân trong bài đăng của tôi.",
    createdAt: "2026-10-18T06:50:00Z",
    status: "PENDING",
  },
  {
    id: "rep-004",
    reporter: {
      id: "usr-07",
      username: "quoc_tuan",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp",
    },
    targetType: "USER",
    targetId: "usr-08",
    targetSummary: "Tài khoản @tai_khoan_gay_roi thường xuyên gửi tin nhắn đe dọa thành viên nhóm",
    targetAuthor: {
      id: "usr-08",
      username: "tai_khoan_gay_roi",
      avatarUrl: null,
    },
    reason: "HATE_SPEECH",
    reasonText: "Ngôn từ thù địch & đe dọa",
    details: "Người dùng này nhắn tin đe dọa bạo lực sau khi có tranh cãi trong bài viết chia sẻ kinh nghiệm.",
    createdAt: "2026-10-17T21:10:00Z",
    status: "RESOLVED",
    resolvedAt: "2026-10-17T22:00:00Z",
    resolvedBy: "admin_he_thong",
    actionTaken: "WARN_USER",
    resolutionNote: "Đã gửi cảnh cáo vi phạm lần 1 đến tài khoản. Khóa quyền bình luận 24 giờ.",
  },
  {
    id: "rep-005",
    reporter: {
      id: "usr-02",
      username: "thao_nguyen",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp",
    },
    targetType: "POST",
    targetId: "post-099",
    targetSummary: "Bài viết chia sẻ video game bạo lực 18+ không che",
    targetAuthor: {
      id: "usr-09",
      username: "game_streamer",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
    },
    reason: "ADULT_CONTENT",
    reasonText: "Nội dung 18+ / Nhạy cảm",
    details: "Video chứa hình ảnh bạo lực máu me không gắn nhãn cảnh báo độ tuổi.",
    createdAt: "2026-10-17T16:20:00Z",
    status: "RESOLVED",
    resolvedAt: "2026-10-17T17:00:00Z",
    resolvedBy: "admin_he_thong",
    actionTaken: "REMOVE_CONTENT",
    resolutionNote: "Đã gỡ bài viết (xóa mềm) theo tiêu chuẩn cộng đồng về nội dung bạo lực.",
  },
  {
    id: "rep-006",
    reporter: {
      id: "usr-03",
      username: "tai_khoan_spam",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp",
    },
    targetType: "POST",
    targetId: "post-101",
    targetSummary: "📢 THÔNG BÁO HỆ THỐNG: Mạng xã hội Connexa chính thức nâng cấp tính năng...",
    targetAuthor: {
      id: "usr-01",
      username: "admin_he_thong",
      avatarUrl: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp",
    },
    reason: "SPAM",
    reasonText: "Spam",
    details: "Bài viết này hiện trên đầu bảng tin làm phiền tôi.",
    createdAt: "2026-10-17T14:00:00Z",
    status: "DISMISSED",
    resolvedAt: "2026-10-17T14:30:00Z",
    resolvedBy: "admin_he_thong",
    actionTaken: "DISMISSED",
    resolutionNote: "Báo cáo không hợp lệ. Đây là bài viết thông báo chính thức của Ban quản trị hệ thống.",
  },
];

export function getMockPaginatedReports(params: ReportFilterParams): PaginatedReportsResponse {
  const page = params.page ?? 0;
  const size = params.size ?? 6;
  const status = params.status || 'PENDING'; // Mặc định mở tab Chờ xử lý
  const targetType = params.targetType || 'ALL';
  const keyword = (params.keyword || '').trim().toLowerCase();

  let filtered = [...MOCK_REPORTS_DATABASE];

  // Lọc theo trạng thái
  if (status !== 'ALL') {
    filtered = filtered.filter((r) => r.status === status);
  }

  // Lọc theo loại đối tượng
  if (targetType !== 'ALL') {
    filtered = filtered.filter((r) => r.targetType === targetType);
  }

  // Lọc theo từ khóa (tên người báo cáo, người bị báo cáo, trích dẫn vi phạm, mã đơn)
  if (keyword) {
    filtered = filtered.filter(
      (r) =>
        r.id.toLowerCase().includes(keyword) ||
        r.reporter.username.toLowerCase().includes(keyword) ||
        (r.targetAuthor && r.targetAuthor.username.toLowerCase().includes(keyword)) ||
        r.targetSummary.toLowerCase().includes(keyword) ||
        r.reasonText.toLowerCase().includes(keyword)
    );
  }

  const pendingCount = MOCK_REPORTS_DATABASE.filter((r) => r.status === 'PENDING').length;
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const startIndex = page * size;
  const items = filtered.slice(startIndex, startIndex + size);

  return {
    items,
    totalElements,
    totalPages,
    page,
    size,
    pendingCount,
    isMock: true,
  };
}

export function mockResolveReport(
  reportId: string,
  payload: ResolveReportPayload
): AdminReport | null {
  const target = MOCK_REPORTS_DATABASE.find((r) => r.id === reportId);
  if (!target) return null;

  target.status = 'RESOLVED';
  target.actionTaken = payload.action;
  target.resolvedAt = new Date().toISOString();
  target.resolvedBy = 'admin_dev';
  target.resolutionNote = payload.note || (payload.action === 'REMOVE_CONTENT' ? 'Đã gỡ nội dung vi phạm.' : 'Đã gửi cảnh cáo đến người dùng.');

  // Đồng bộ dữ liệu sang Module Bài viết: Nếu gỡ nội dung bài viết, tự động xóa mềm bài viết trong mock posts!
  if (payload.action === 'REMOVE_CONTENT' && target.targetType === 'POST') {
    mockSoftDeletePost(target.targetId);
  }

  return { ...target };
}

export function mockDismissReport(
  reportId: string,
  payload: DismissReportPayload
): AdminReport | null {
  const target = MOCK_REPORTS_DATABASE.find((r) => r.id === reportId);
  if (!target) return null;

  target.status = 'DISMISSED';
  target.actionTaken = 'DISMISSED';
  target.resolvedAt = new Date().toISOString();
  target.resolvedBy = 'admin_dev';
  target.resolutionNote = payload.note || 'Báo cáo bị bác bỏ do không vi phạm tiêu chuẩn cộng đồng.';

  return { ...target };
}
