-- Cho phép báo cáo từ hệ thống AI không cần reporter_id, bổ sung nguồn báo cáo và độ tin cậy của AI
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'USER';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_reports_source ON reports(source);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_ai_pending_target
    ON reports(target_type, target_id)
    WHERE source = 'AI_MODERATION' AND status = 'PENDING';

-- Lưu nội dung/lý do cảnh báo hệ thống (SYSTEM_WARNING) cho người dùng
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;

