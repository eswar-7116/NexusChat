import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { Send, SendHorizontal, SendIcon, X } from 'lucide-react';

function ChatWindow() {
  const { user, onlineUsers } = useAuthStore();
  const { selectedUser } = useChatStore();

  const [message, setMessage] = React.useState("");
  const textareaRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message:", message);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }    
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Top bar */}
      <div className="p-2.5 border-b border-base-300 bg-base-300">
        <div className="flex items-center justify-between p-1">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/profile.png"} alt={selectedUser.fullName} />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        Messages
      </div>

      {/* Message input */}
      <div className="p-3 bg-base-200 border-t border-base-300">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Input field */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Type a message..."
              rows="1"
              className="w-full py-2 px-4 bg-base-100 rounded border-none focus:ring-2 focus:ring-primary focus:outline-none resize-none min-h-10 max-h-32 overflow-y-auto"
            />
          </div>
          
          {/* Send button */}
          <button 
            type="submit" 
            className={`p-2 rounded-full ${message.trim() ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/50'} transition-colors`}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  )
}

export default ChatWindow;