import React from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

function ChatInput({ sendMessage }) {
  const [message, setMessage] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const textareaRef = React.useRef(null);
  const emojiPickerRef = React.useRef(null);

  // Detect if the user is on a mobile device
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check initially
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSending(true);
    const messageContent = message.trim();
    setMessage(""); // Clear input immediately

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage({
        message: messageContent,
      });
    } catch (error) {
      console.error("Error while sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emojiData, _) => {
    // Only process if textarea is available
    if (!textareaRef.current) {
      return;
    }

    // Get cursor position
    const cursorPosition = textareaRef.current.selectionStart;
    const endPosition = textareaRef.current.selectionEnd;

    // Insert emoji at cursor position
    const newMessage = message.substring(0, cursorPosition) + emojiData.emoji + message.substring(endPosition);

    // Update the message
    setMessage(newMessage);

    // Calculate new cursor position
    const newCursorPosition = cursorPosition + emojiData.emoji.length;

    // Focus back on textarea after inserting emoji and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;

        // Update textarea height to accommodate new content
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
      }
    }, 10);
  };

  return (
    <>
      <div className="p-3 bg-base-200 border-t border-base-300">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Emoji button */}
          {!isMobile && <button
            id="emoji-button"
            type="button"
            className={`p-2 rounded-full transition-colors cursor-pointer transform transition-transform duration-300 hover:scale-110 ${showEmojiPicker ? 'bg-base-300' : 'bg-base-100 hover:bg-base-300'}`}
            onClick={() => {
              setShowEmojiPicker(prevState => !prevState);
            }}
            aria-label={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
          >
            <Smile size={20} />
          </button>}

          {/* Input field */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              name='Message input field'
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                setShowEmojiPicker(false);
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (isMobile) {
                    // On mobile, don't prevent default, allowing normal newline behavior
                    return;
                  } else {
                    // On desktop, prevent default and send the message
                    e.preventDefault();
                    if (message.trim()) {
                      handleSubmit(e);
                    }
                  }
                }
              }}
              placeholder={isMobile ? "Type a message..." : "Type a message (press Enter to send, Shift+Enter for new line)"}
              rows="1"
              className="text-sm sm:text-md w-full py-2 px-4 bg-base-100 rounded border-none focus:ring-2 focus:ring-primary focus:outline-none resize-none min-h-10 max-h-32 overflow-y-auto"
            />

            {/* Emoji picker */}
            {showEmojiPicker && !isMobile && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 z-10"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  width={300}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            className={`p-2 rounded-full ${message.trim() ? 'bg-primary text-primary-content transform transition-transform duration-300 hover:scale-110 cursor-pointer' : 'bg-base-300 text-base-content/50'} transition-colors`}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatInput;