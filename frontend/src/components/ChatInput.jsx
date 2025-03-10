import React from 'react';
import { Send } from 'lucide-react';

function ChatInput({ sendMessage }) {
  const [message, setMessage] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const textareaRef = React.useRef(null);

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

  return (
    <>
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
                // Only use Enter to send on desktop devices
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (isMobile) {
                    // On mobile, we don't prevent default, allowing normal newline behavior
                    return;
                  } else {
                    // On desktop, we prevent default and send the message
                    e.preventDefault();
                    if (message.trim()) {
                      handleSubmit(e);
                    }
                  }
                }
              }}
              placeholder={isMobile ? "Type a message (press Enter for new line)" : "Type a message (press Enter to send, Shift+Enter for new line)"}
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

      {/* Mobile keyboard tip */}
      {isMobile && (
        <div className="text-center text-xs text-base-content/50 pb-1">
          Use the send button to submit your message
        </div>
      )}
    </>
  );
}

export default ChatInput;