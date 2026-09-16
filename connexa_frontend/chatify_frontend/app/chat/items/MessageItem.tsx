interface MessageItemProps {
  content: string;
  time: string;
  isMe: boolean;
  avatar?: string;
  attachmentUrl?: string; // 🌟 SỬA THÀNH attachmentUrl ĐỂ KHỚP VỚI page.tsx
  isSystem?: boolean;
}

export const MessageItem = ({ content, time, isMe, avatar, attachmentUrl, isSystem }: MessageItemProps) => {
  
  // 1. TIN NHẮN HỆ THỐNG (Hiện ở giữa)
  if (isSystem) {
    return (
      <div className="d-flex justify-content-center my-3">
        <span className="badge bg-secondary rounded-pill text-light px-3 py-2" style={{ opacity: 0.6, fontWeight: "normal" }}>
          {content}
        </span>
      </div>
    );
  }

  // 2. BONG BÓNG TIN NHẮN BÌNH THƯỜNG
  return (
    <div className={`d-flex flex-row ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
      
      {/* ẢNH ĐẠI DIỆN NGƯỜI KHÁC (BÊN TRÁI) */}
      {!isMe && avatar && (
        <img 
          src={avatar} 
          alt="avatar" 
          className="rounded-circle shadow-sm align-self-start" 
          style={{ width: "45px", height: "45px", objectFit: "cover" }} 
        />
      )}
      
      <div style={{ maxWidth: "75%" }}> 
        
        <div 
            className={`small p-2 ${isMe ? 'me-3 text-white bg-primary' : 'ms-3 bg-body-secondary'} mb-1 rounded-3 text-break`}
            style={{ whiteSpace: "pre-wrap" }}
        >
          {content}

          {attachmentUrl && (
            <img 
              src={attachmentUrl} 
              className="d-block mt-2 rounded shadow-sm" 
              style={{ maxWidth: '100%', height: 'auto' }} 
              alt="sent attachment" 
            />
          )}
        </div>
        
        <p className={`small ${isMe ? 'me-3' : 'ms-3'} mb-0 text-muted ${isMe ? 'text-end' : ''}`}>
          {time}
        </p>
      </div>

      {isMe && avatar && (
        <img 
          src={avatar} 
          alt="avatar" 
          className="rounded-circle shadow-sm align-self-start" 
          style={{ width: "45px", height: "45px", objectFit: "cover" }} 
        />
      )}
    </div>
  );
};