import api from "@/app/utils/api";

export type UserReportTargetType = "POST" | "COMMENT" | "USER";

export type UserReportReason =
  | "SPAM"
  | "SCAM"
  | "HATE_SPEECH"
  | "HARASSMENT"
  | "ADULT_CONTENT"
  | "IMPERSONATION"
  | "OTHER";

export interface ReportReasonOption {
  value: UserReportReason;
  label: string;
  description: string;
}

export const REPORT_REASON_OPTIONS: ReportReasonOption[] = [
  {
    value: "SPAM",
    label: "Spam / Quảng cáo rác",
    description: "Đăng tin quảng cáo lặp lại, kéo tương tác hoặc gắn link rác.",
  },
  {
    value: "SCAM",
    label: "Lừa đảo / Giả mạo giao dịch",
    description: "Rủ rê đầu tư, bán hàng giả, yêu cầu chuyển cọc đáng ngờ.",
  },
  {
    value: "HARASSMENT",
    label: "Quấy rối / Xúc phạm",
    description: "Công kích cá nhân, đe dọa hoặc bắt nạt thành viên khác.",
  },
  {
    value: "HATE_SPEECH",
    label: "Ngôn từ thù địch",
    description: "Phân biệt đối xử, kích động thù hận hoặc bạo lực.",
  },
  {
    value: "ADULT_CONTENT",
    label: "Nội dung nhạy cảm / 18+",
    description: "Hình ảnh hoặc ngôn từ đồi trụy, bạo lực phản cảm.",
  },
  {
    value: "IMPERSONATION",
    label: "Mạo danh cá nhân / tổ chức",
    description: "Giả mạo quản trị viên, nhà trường hoặc người khác.",
  },
  {
    value: "OTHER",
    label: "Vi phạm khác",
    description: "Nội dung vi phạm quy chuẩn cộng đồng khác.",
  },
];

export interface CreateUserReportPayload {
  targetType: UserReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export async function submitReport(payload: CreateUserReportPayload) {
  const res = await api.post("/api/v1/reports", payload);
  return res.data;
}

