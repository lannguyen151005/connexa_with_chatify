-- =========================================================================
-- Migration: Thêm Index tối ưu hóa cho Tìm kiếm Bài viết & Kiểm tra Bạn bè
-- Quy chuẩn: V<Timestamp>__<tên_hành_động>.sql
-- =========================================================================

-- 1. Tối ưu truy vấn kiểm tra quyền riêng tư bạn bè 2 chiều (EXISTS trong PostRepo)
-- Phục vụ cho Newsfeed, Timeline và Search khi lọc privacy FRIENDS_ONLY
CREATE INDEX IF NOT EXISTS idx_friendships_sender_status_receiver 
    ON friendships (sender_id, status, receiver_id);

CREATE INDEX IF NOT EXISTS idx_friendships_receiver_status_sender 
    ON friendships (receiver_id, status, sender_id);

-- 2. Tối ưu truy vấn tìm kiếm bài viết theo Hashtag (PostHashtag: hashtag -> post)
-- Giúp Postgres Index-Only Scan khi kiểm tra bài viết thuộc hashtag cụ thể
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_post 
    ON post_hashtags (hashtag_id, post_id);

-- 3. Tối ưu lọc bài viết chưa xóa mềm và sắp xếp phân trang ổn định theo thời gian
-- Phục vụ ORDER BY p.createdAt desc, p.id desc WHERE is_deleted = false
CREATE INDEX IF NOT EXISTS idx_posts_active_created_id 
    ON posts (is_deleted, created_at DESC, id DESC);
