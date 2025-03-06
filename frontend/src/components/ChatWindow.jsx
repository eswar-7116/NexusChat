import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { Send, X } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import Modal from './Modal';

function ChatWindow() {
  const { onlineUsers } = useAuthStore();
  const { selectedUser, messages, isFetchingMessages, fetchMessages } = useChatStore();

  const [message, setMessage] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const textareaRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message:", message);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleProfilePicClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Top bar */}
      <div className="p-2.5 border-b border-base-300 bg-base-300">
        <div className="flex items-center justify-between p-1">
          <div className="flex items-center gap-3">
            {/* Avatar with status dot */}
            <div className="avatar" onClick={handleProfilePicClick}>
              <div className="size-10 rounded-full relative cursor-pointer">
                <img src={selectedUser.profilePic || "/profile.png"} alt={selectedUser.fullName} />
              </div>
              {onlineUsers.some(onlineUser => onlineUser._id === selectedUser._id) && (
                <span
                  className="absolute bottom-0 right-0 size-2.5 sm:size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {selectedUser.username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {isFetchingMessages ? <div className='flex items-center justify-center h-full w-full'>
        <PropagateLoader color="#b5b3b3" />
      </div> : <div className="flex-1 overflow-y-auto px-2 space-y-4">
        Messages
      </div>}

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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        isOnline={onlineUsers.some(onlineUser => onlineUser._id === selectedUser._id)}
      />
    </div>
  );
}

export default ChatWindow;
