DO $$ 
BEGIN
    -- Chỉ chạy lệnh đổi tên nếu tìm thấy bảng 'friend_requests' cũ
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friend_requests') THEN
        ALTER TABLE friend_requests RENAME TO friendships;
    END IF;
END $$;
