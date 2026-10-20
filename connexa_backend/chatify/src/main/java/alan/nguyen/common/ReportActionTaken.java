package alan.nguyen.common;

public enum ReportActionTaken {
    REMOVE_CONTENT, // Gỡ nội dung vi phạm
    LOCK_USER,      // Khóa tài khoản người dùng vi phạm
    WARN_USER,      // Cảnh cáo tác giả
    DISMISSED,      // Bác bỏ đơn
    NO_ACTION       // Không áp dụng kỷ luật
}
