import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { MessageCircleOff, Send } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import Modal from './Modal';

function ChatWindow() {
  const { user, onlineUsers } = useAuthStore();
  const { selectedUser, messages, isFetchingMessages, sendMessage, listenToUser, stopListeningToUser } = useChatStore();

  const [message, setMessage] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const textareaRef = React.useRef(null);
  const chatBoxBottomRef = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        message,
      });

      setMessage("");
      if (textareaRef.current)
        textareaRef.current.style.height = 'auto';
    } catch (error) {
      console.error("Error while sending message:", error);
    }
  };

  const handleProfilePicClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  React.useEffect(() => {
    if (chatBoxBottomRef.current) {
      chatBoxBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isFetchingMessages]);

  React.useEffect(() => {
    if (chatBoxBottomRef.current) {
      chatBoxBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  React.useEffect(() => {
    listenToUser(selectedUser._id);

    return () => stopListeningToUser();
  }, [selectedUser._id, listenToUser, stopListeningToUser])

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
              {onlineUsers.some(onlineUser => onlineUser === selectedUser._id) && (
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
          
          {/* Last seen status - added to the right side of top bar */}
          <div className="text-sm text-base-content/70">
            {onlineUsers.some(onlineUser => onlineUser === selectedUser._id) 
              ? "Online" 
              : selectedUser.lastSeen 
                ? `Last seen ${new Date(selectedUser.lastSeen).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}`
                : "Offline"
            }
          </div>
        </div>
      </div>

      {/* Chat Box */}
      {isFetchingMessages ? <div className='flex items-center justify-center h-full w-full'>
        <PropagateLoader color="#b5b3b3" />
      </div> :
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {messages.length === 0 ? <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center gap-2">
              <MessageCircleOff size={64} />
              <p className="text-base-content/70 text-lg font-semibold">No messages yet</p>
            </div>
          </div> : (
            (() => {
              // Group messages by date
              let currentDate = null;
              return messages.map((message, idx) => {
                // Format the message date (just the date part)
                const messageDate = new Date(message.timestamp).toLocaleDateString('en-IN');

                // Check if we need to show a date divider
                const showDateDivider = messageDate !== currentDate;

                // Update current date
                if (showDateDivider) {
                  currentDate = messageDate;
                }

                return (
                  <React.Fragment key={idx}>
                    {/* Date divider */}
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-4">
                        <div className="h-px bg-base-300 flex-grow"></div>
                        <div className="px-2 text-xs text-base-content/50 font-medium">
                          {messageDate === new Date().toLocaleDateString('en-IN')
                            ? 'Today'
                            : messageDate === new Date(Date.now() - 86400000).toLocaleDateString('en-IN')
                              ? 'Yesterday'
                              : messageDate
                          }
                        </div>
                        <div className="h-px bg-base-300 flex-grow"></div>
                      </div>
                    )}

                    {/* Chat */}
                    <div className={`chat ${message.senderId === user._id ? 'chat-end' : 'chat-start'}`}>
                      <div className="chat-header mb-1">
                        <time dateTime={message.timestamp} className='text-xs opacity-50 ml-1'>
                          {new Date(message.timestamp).toLocaleString(undefined, {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </time>
                      </div>

                      <div
                        className={`chat-bubble whitespace-pre-wrap ${message.senderId === user._id
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                            : 'bg-blue-600 text-white dark:bg-blue-700'
                          }`}
                      >
                        <p>{message.content}</p>
                      </div>

                      {message.senderId === user._id && (
                        <div className="chat-footer opacity-50 text-xs">
                          {message.isRead ? "Seen" : "Delivered"}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              });
            })()
          )}
          <div ref={chatBoxBottomRef} />
        </div>
      }

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
        isOnline={onlineUsers.some(onlineUser => onlineUser === selectedUser._id)}
      />
    </div>
  );
}

export default ChatWindow;
