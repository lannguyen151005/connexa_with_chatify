import { useState } from "react";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onTyping: () => void;
    onUploadFile: (file: File) => void; 
}

export const ChatInput = ({ onSendMessage, onTyping, onUploadFile }: ChatInputProps) => {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText(""); 
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            handleSend();       
        }
    };

    return (
        <div className="text-muted d-flex justify-content-start align-items-center p-3">
            
            <textarea
                className="form-control form-control-lg"
                placeholder="Type message..."
                value={text}
                onChange={(e) => { setText(e.target.value); onTyping(); }}
                onKeyDown={handleKeyDown}
                rows={1} 
                style={{
                    resize: "none",        
                    overflowY: "auto",     
                    maxHeight: "120px",    
                    whiteSpace: "pre-wrap" 
                }}
            />
            
            <label className="ms-3 text-muted mb-0" style={{ cursor: 'pointer' }}>
                <i className="fas fa-paperclip" style={{ fontSize: '1.3rem' }}></i>
                <input 
                    type="file" 
                    hidden 
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            onUploadFile(e.target.files[0]);
                        }
                    }} 
                />
            </label>
            
            <a className="ms-3 text-muted" href="#!">
                <i className="fas fa-smile" style={{ fontSize: '1.3rem' }}></i>
            </a>
            
            <button className="btn p-0 ms-3 text-primary" onClick={handleSend}>
                <i className="fas fa-paper-plane" style={{ fontSize: '1.3rem' }}></i>
            </button>
        </div>
    );
};