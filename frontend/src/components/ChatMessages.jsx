import React from 'react';
import { MessageCircleOff } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useAuthStore } from '../stores/authStore';

function ChatMessages({ messages, isFetchingMessages }) {
  const { user } = useAuthStore();
  const chatBoxBottomRef = React.useRef(null);
  
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

  if (isFetchingMessages) {
    return (
      <div className='flex items-center justify-center h-full w-full'>
        <PropagateLoader color="#b5b3b3" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-2">
          <MessageCircleOff size={64} />
          <p className="text-base-content/70 text-lg font-semibold">No messages yet</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const renderMessages = () => {
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
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-4">
      {renderMessages()}
      <div ref={chatBoxBottomRef} />
    </div>
  );
}

export default ChatMessages;