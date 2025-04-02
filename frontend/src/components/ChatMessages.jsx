import React, { useState } from 'react';
import { MessageCircleOff, Trash2, MoreVertical, Ban, Copy } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import toast from 'react-hot-toast';

function ChatMessages({ messages, isFetchingMessages }) {
  const { user } = useAuthStore();
  const { selectedUser, deleteForMe, deleteMessageForEveryone } = useChatStore();
  const chatBoxBottomRef = React.useRef(null);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [messageWithOpenMenu, setMessageWithOpenMenu] = useState(null);

  React.useEffect(() => {
    if (chatBoxBottomRef.current) {
      chatBoxBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isFetchingMessages]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageWithOpenMenu && !event.target.closest('.message-menu-container')) {
        setMessageWithOpenMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [messageWithOpenMenu]);

  const toggleTimeFormat = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  const toggleMenu = (e, messageId) => {
    e.stopPropagation();
    const isOpening = messageWithOpenMenu !== messageId;
    setMessageWithOpenMenu(messageWithOpenMenu === messageId ? null : messageId);

    // If opening a menu, scroll it into view after DOM update
    if (isOpening) {
      setTimeout(() => {
        const menuElement = document.querySelector(`[data-menu-id="${messageId}"]`);
        if (menuElement) {
          menuElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 10);
    }
  };

  const copyMessage = (e, msgContent) => {
    navigator.clipboard.writeText(msgContent);
    toast.success("Copied message!");
  };

  const handleDeleteForMe = (e, messageId, messageIdx) => {
    e.stopPropagation();
    deleteForMe(messageId, messageIdx);
    setMessageWithOpenMenu(null);
  };

  const handleDeleteForEveryone = (e, messageId) => {
    e.stopPropagation();
    setMessageWithOpenMenu(null);
    deleteMessageForEveryone(messageId);
  };

  if (isFetchingMessages) {
    return (
      <div className='flex items-center justify-center h-full w-full'>
        <PropagateLoader color="#b5b3b3" />
      </div>
    );
  }

  // Filter messages - hiding deleted ones for current user
  const visibleMessages = messages
    .filter(message =>
      !message.deletedFor || !message.deletedFor.includes(user._id)
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));  // Sort by timestamp

  if (visibleMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-2">
          <MessageCircleOff size={48} className="sm:size-64" />
          <p className="text-base-content/70 text-base sm:text-lg font-semibold">No messages yet</p>
        </div>
      </div>
    );
  }

  const renderMessages = () => {
    let currentDate = null;

    return visibleMessages.map((message, idx) => {
      const messageDate = new Date(message.timestamp).toLocaleDateString('en-IN');
      const showDateDivider = messageDate !== currentDate;

      if (showDateDivider) {
        currentDate = messageDate;
      }

      const isExpanded = expandedMessageId === message._id;
      const isMenuOpen = messageWithOpenMenu === message._id;
      const messageTime = new Date(message.timestamp).toLocaleString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      const messageFullTime = new Date(message.timestamp).toLocaleString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const isUserMessage = message.senderId === user._id;
      const isDeletedBySelectedUser = message.deletedFor &&
        selectedUser &&
        message.deletedFor.includes(selectedUser._id);

      return (
        <React.Fragment key={idx}>
          {showDateDivider && (
            <div className="flex items-center justify-center my-3 sm:my-4">
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

          <div className={`chat ${isUserMessage ? 'chat-end' : 'chat-start'} relative`}>
            <div className="chat-header mb-1 flex items-center">
              <time
                dateTime={message.timestamp}
                className='text-xs opacity-50 ml-1 cursor-pointer hover:opacity-100 hover:underline'
                onClick={() => toggleTimeFormat(message._id)}
              >
                {isExpanded ? messageFullTime : messageTime}
              </time>

              <div className="relative ml-1 sm:ml-2">
                <button
                  onClick={(e) => toggleMenu(e, message._id)}
                  className="p-1 hover:bg-base-200 rounded-full active:bg-base-300"
                  aria-label="Message options"
                >
                  <MoreVertical size={15} className="sm:size-4" />
                </button>

                {isMenuOpen && (
                  <div className={`absolute z-10 mt-1 bg-base-100/90 font-bold shadow-lg rounded-lg overflow-hidden border border-base-300 w-40 sm:w-48 ${isUserMessage ? 'right-0' : 'left-0'}`} data-menu-id={message._id}>
                    <ul className="py-1">
                      {/* Copy */}
                      <li>
                        <button
                          className="w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-base-200/75 active:bg-base-300/75 flex items-center gap-2"
                          onClick={(e) => copyMessage(e, message.content)}
                        >
                          <Copy size={12} className="sm:size-5" />
                          Copy
                        </button>
                      </li>

                      {/* Delete for me */}
                      <li>
                        <button
                          className="w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-base-200/75 active:bg-base-300/75 flex items-center gap-2 text-red-500"
                          onClick={(e) => handleDeleteForMe(e, message._id, messages.indexOf(message))}
                        >
                          <Trash2 size={12} className="sm:size-5" />
                          Delete for me
                        </button>
                      </li>

                      {/* Delete for everyone */}
                      {isUserMessage && !message.deletedForEveryoneBy && (
                        <li>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-base-200/75 active:bg-base-300/75 flex items-center gap-2 text-red-600"
                            onClick={(e) => handleDeleteForEveryone(e, message._id)}
                          >
                            <Trash2 size={12} className="sm:size-5" />
                            Delete for everyone
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`chat-bubble text-sm sm:text-base whitespace-pre-wrap break-words max-w-56 sm:max-w-xs md:max-w-lg ${isUserMessage
                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                : 'bg-blue-600 text-white dark:bg-blue-700'
                }`}
            >
              {message.deletedForEveryoneBy ? (
                <p className="italic opacity-70 flex items-center">
                  <Ban size={14} className="mr-1.5" />
                  {message.deletedForEveryoneBy === user._id
                    ? "You deleted this message for everyone"
                    : message.deletedForEveryoneBy === selectedUser?._id
                      ? `${selectedUser.username} deleted this message`
                      : "This message was deleted"}
                </p>
              ) : (
                <p className="overflow-hidden text-wrap">{message.content}</p>
              )}
              {isDeletedBySelectedUser && !message.deletedForEveryoneBy && (
                <div className="text-xs italic mt-1 opacity-70">
                  Deleted for {selectedUser.username}
                </div>
              )}
            </div>

            {isUserMessage && (
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
    <div className="flex-1 overflow-y-auto px-1 sm:px-2 space-y-3 sm:space-y-4 pb-6">
      {renderMessages()}
      <div ref={chatBoxBottomRef} />
    </div>
  );
}

export default ChatMessages;