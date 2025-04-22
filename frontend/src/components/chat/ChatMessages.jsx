import React from 'react';
import { MessageCircleOff, Trash2, MoreVertical, Ban, Copy, SquarePen, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { PropagateLoader } from 'react-spinners';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import Linkify from 'linkify-react';
import toast from 'react-hot-toast';

function ChatMessages({ messages, isFetchingMessages }) {
  const { user } = useAuthStore();
  const {
    selectedUser,
    deleteForMe,
    deleteMessageForEveryone,
    updateMessage,
    pendingMessages,
    failedMessages,
    retryMessage
  } = useChatStore();

  const chatBoxBottomRef = React.useRef(null);
  const [expandedMessageId, setExpandedMessageId] = React.useState(null);
  const [messageWithOpenMenu, setMessageWithOpenMenu] = React.useState(null);
  const [editingMessageId, setEditingMessageId] = React.useState(null);
  const [editedContent, setEditedContent] = React.useState("");
  const editInputRef = React.useRef(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (chatBoxBottomRef.current) {
      chatBoxBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, pendingMessages, failedMessages, isFetchingMessages]);

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

  React.useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      // Position cursor at the end of text
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [editingMessageId]);

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

  // Function to check if message is within 5 minutes
  const isWithinFiveMinutes = (timestamp) => {
    const messageTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    return currentTime - messageTime <= fiveMinutesInMs;
  };

  const handleEditMessage = (e, message) => {
    e.stopPropagation();
    setMessageWithOpenMenu(null);
    setEditingMessageId(message._id);
    setEditedContent(message.content);
  };

  const saveEditedMessage = async (messageId) => {
    if (editedContent.trim() === '') return;

    try {
      await updateMessage(messageId, editedContent);
      setEditingMessageId(null);
      setEditedContent('');
    } catch (error) {
      toast.error("Failed to update message");
      console.error(error);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
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

  const linkifyOptions = {
    target: '_blank',
    className: 'italic underline text-inherit hover:opacity-80',
    rel: 'noopener noreferrer'
  }

  const getMessageStatus = (message) => {
    if (message.status === 'sending') return "Sending...";
    if (message.status === 'failed') return "Couldn't send";
    if (message.isRead) return "Seen";
    return "Delivered";
  };

  // Filter messages and combine with pending/failed messages
  const getAllMessages = () => {
    // Filter out deleted messages
    const visibleMessages = messages.filter(message =>
      !message.deletedFor || !message.deletedFor.includes(user._id)
    );

    // Combine all message types and sort by timestamp
    return [...visibleMessages, ...pendingMessages, ...failedMessages]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  if (isFetchingMessages) {
    return (
      <div className='flex items-center justify-center h-full w-full'>
        <PropagateLoader color="#b5b3b3" />
      </div>
    );
  }

  const allMessages = getAllMessages();

  if (allMessages.length === 0) {
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

    return allMessages.map((message, idx) => {
      const messageDate = new Date(message.timestamp).toLocaleDateString('en-IN');
      const showDateDivider = messageDate !== currentDate;

      if (showDateDivider) {
        currentDate = messageDate;
      }

      const isExpanded = expandedMessageId === message._id;
      const isMenuOpen = messageWithOpenMenu === message._id;
      const isEditing = editingMessageId === message._id;
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
      const isFailed = message.status === 'failed';
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

          <div className={`chat ${isUserMessage ? 'chat-end' : 'chat-start'} relative m-1`}>
            <div className="chat-header mb-1 flex items-center">
              <time
                dateTime={message.timestamp}
                className='text-xs opacity-50 ml-1 cursor-pointer hover:opacity-100 hover:underline'
                onClick={() => toggleTimeFormat(message._id)}
              >
                {isExpanded ? messageFullTime : messageTime}
              </time>

              {/* Only show menu for sent messages, not pending/failed ones */}
              {!message.status && (
                <div className="relative ml-1 sm:ml-2">
                  <button
                    onClick={(e) => toggleMenu(e, message._id)}
                    className="p-1 hover:bg-base-200 rounded-full active:bg-base-300"
                    aria-label="Message options"
                  >
                    <MoreVertical size={15} className="sm:size-4" />
                  </button>

                  {isMenuOpen && (
                    <div className={`absolute z-10 mt-1 bg-base-100/90 font-bold shadow-lg rounded-lg overflow-hidden border border-base-300 w-40 sm:w-48 ${isUserMessage ? 'right-0' : 'left-0'} message-menu-container`} data-menu-id={message._id}>
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

                        {/* Edit - only shown for own messages within 5 minutes */}
                        {isUserMessage && isWithinFiveMinutes(message.timestamp) && !message.deletedForEveryoneBy && (
                          <li>
                            <button
                              className="w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-base-200/75 active:bg-base-300/75 flex items-center gap-2"
                              onClick={(e) => handleEditMessage(e, message)}
                            >
                              <SquarePen size={12} className="sm:size-5" />
                              Edit
                            </button>
                          </li>
                        )}

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
              )}
            </div>

            <div
              className={`chat-bubble text-sm sm:text-base whitespace-pre-wrap break-words max-w-56 sm:max-w-xs md:max-w-lg ${isUserMessage
                ? isFailed
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  : message.status === 'sending'
                    ? 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
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
              ) : isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    ref={editInputRef}
                    className="font-for-emoji w-full bg-base-200 text-base-content p-2 rounded border border-base-300 min-h-[60px] resize-none"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveEditedMessage(message._id);
                      } else if (e.key === 'Escape' || e.key === 'Esc') {
                        e.stopPropagation();
                        cancelEdit();
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="p-1 hover:bg-base-300 rounded-full"
                      aria-label="Cancel edit"
                    >
                      <X size={18} className="text-error" />
                    </button>
                    <button
                      onClick={() => saveEditedMessage(message._id)}
                      className="p-1 hover:bg-base-300 rounded-full"
                      aria-label="Save edit"
                      disabled={editedContent.trim() === ''}
                    >
                      <Check size={18} className="text-success" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Linkify options={linkifyOptions}><p className='font-for-emoji overflow-hidden text-wrap'>{message.content}</p></Linkify>
                  {message.edited && (
                    <span className="text-xs italic mt-1 opacity-60 ml-1">
                      (edited)
                    </span>
                  )}
                </div>
              )}
              {isDeletedBySelectedUser && !message.deletedForEveryoneBy && (
                <div className="text-xs italic mt-1 opacity-70">
                  Deleted for {selectedUser.username}
                </div>
              )}
            </div>

            {isUserMessage && !isEditing && (
              <div className="chat-footer opacity-50 text-xs flex items-center">
                {isFailed ? (
                  <div className="flex items-center text-red-500">
                    <AlertCircle size={12} className="mr-1" />
                    Couldn&apos;t send
                    <button
                      onClick={() => retryMessage(message)}
                      className="ml-2 p-0.5 bg-base-300 hover:bg-base-200 rounded text-base-content"
                      aria-label="Retry sending message"
                    >
                      <RefreshCw size={10} />
                    </button>
                  </div>
                ) : (
                  getMessageStatus(message)
                )}
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