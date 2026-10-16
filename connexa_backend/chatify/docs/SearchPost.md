Dưới đây là checklist gọn để **1 người tự triển khai toàn bộ luồng Search** theo đúng scope đồ án 5 người.

# CHECKLIST TỐI ƯU POST SEARCH

## 1. Khảo sát hiện trạng

* [ ] Đọc `PostSearchController`
* [ ] Đọc `PostSearchService/Impl`
* [ ] Đọc `PostRepo`
* [ ] Đọc `HashtagRepo`
* [ ] Kiểm tra `Post`, `PostHashtag`, `PostMedia`, `Friendship`
* [ ] Kiểm tra Flyway index hiện tại
* [ ] Xác định các đoạn có nguy cơ N+1

## 2. Chuẩn hóa Search Query

* [ ] HQL dùng tên field Java: `isDeleted`, `createdAt`
* [ ] Dùng named parameter thống nhất
* [ ] Tất cả query có `isDeleted = false`
* [ ] Privacy đúng:

  * [ ] `PUBLIC` → mọi người
  * [ ] `FRIENDS_ONLY` → ACCEPTED friend
  * [ ] `PRIVATE` → chỉ author
* [ ] Sort bằng:

```text
createdAt DESC, id DESC
```

## 3. Input & Pagination

* [ ] `keyword` null/blank → empty result
* [ ] `keyword` max 100–200 ký tự
* [ ] `page >= 0`
* [ ] `size` mặc định 20
* [ ] `size <= 30`
* [ ] Normalize hashtag: `trim → bỏ # → lowercase`
* [ ] `#` → empty result
* [ ] Escape `\`, `%`, `_` cho LIKE

## 4. Loại bỏ N+1

### Hashtag

* [ ] Tạo `getHashtagNamesByPostIds(List<UUID>)`
* [ ] Lấy toàn bộ `postIds` sau query Post
* [ ] Batch query `WHERE post_id IN (...)`
* [ ] Group thành `Map<UUID, List<String>>`
* [ ] Không gọi query hashtag bên trong loop/stream

### Media

* [ ] Kiểm tra `mediaList` có gây lazy query từng Post không
* [ ] Nếu có → batch query theo `postIds`
* [ ] Group thành `Map<UUID, List<...>>`
* [ ] Không fetch join `mediaList` mặc định trong query pagination

### Author

* [ ] Kiểm tra `author`
* [ ] Nếu cần → `join fetch p.author` hoặc batch fetch
* [ ] Không phát sinh query theo từng Post

## 5. Hashtag Search

* [ ] Nếu DB luôn lưu lowercase → dùng:

```sql
hashtag.name = :tagName
```

* [ ] Không dùng `lower(hashtag.name)` nếu không cần
* [ ] Kiểm tra unique/index `hashtags.name`

## 6. Database Index

Kiểm tra trước, chỉ thêm nếu chưa có:

* [ ] `hashtags(name)` unique
* [ ] `post_hashtags(hashtag_id, post_id)`
* [ ] `post_hashtags(post_id)` nếu thực sự cần
* [ ] Friendship index cho 2 chiều sender/receiver + status
* [ ] Index Post theo query thực tế (`author_id`, `created_at`, ...)

## 7. Không over-engineer

* [ ] Không Elasticsearch
* [ ] Không OpenSearch
* [ ] Không Kafka
* [ ] Không Redis Search
* [ ] Không Search Microservice
* [ ] Không Cursor Pagination

## 8. Test Correctness

* [ ] PUBLIC + stranger → thấy
* [ ] FRIENDS_ONLY + ACCEPTED friend → thấy
* [ ] FRIENDS_ONLY + pending friend → không thấy
* [ ] FRIENDS_ONLY + stranger → không thấy
* [ ] PRIVATE + author → thấy
* [ ] PRIVATE + stranger → không thấy
* [ ] Deleted Post → không thấy
* [ ] `java`, `#java`, `JAVA`, `#JAVA` → cùng kết quả
* [ ] `%`, `_`, `\` → xử lý đúng
* [ ] Pagination không duplicate/mất Post

## 9. Kiểm tra N+1

* [ ] Chạy search với `size = 20`
* [ ] Bật SQL logging hoặc query counter
* [ ] Xác nhận không có query tăng theo từng Post
* [ ] Đặc biệt kiểm tra Hashtag, Media, Author

Mục tiêu:

```text
O(1) query theo page
không phải O(N) theo số Post
```

## 10. Performance

* [ ] Dùng `EXPLAIN (ANALYZE, BUFFERS)` cho query quan trọng
* [ ] Kiểm tra Seq Scan / Index Scan
* [ ] Chưa cần `pg_trgm` nếu dữ liệu nhỏ
* [ ] Chỉ thêm `pg_trgm` khi benchmark chứng minh cần

## 11. Final Review

* [ ] Build pass
* [ ] Test pass
* [ ] Không thay đổi API ngoài scope
* [ ] Không trả Entity trực tiếp từ Controller
* [ ] DTO mapping rõ ràng
* [ ] Code không có query trong loop
* [ ] Privacy nhất quán giữa Feed / Profile / Search

### Definition of Done

```text
Privacy đúng
+ N+1 đã loại bỏ
+ Pagination ổn định
+ Input an toàn
+ Index hợp lý
+ Test pass
+ Không over-engineering
```
