import React from 'react';
import { X, Ban, MessageSquare, UnlockIcon } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';

function Modal({ isOpen, onClose, user, isOnline }) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { blocked, blockedByUser, blockUser, unblockUser } = useChatStore();

  React.useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === "Escape" || e.key === "Esc") {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }
      };
      setIsAnimating(true);
      window.addEventListener("keydown", handleEscape, true);

      return () => {
        window.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isOpen) {
      setIsAnimating(false);
      setTimeout(() => onClose(), 200);
    }
  };

  const handleBlock = () => {
    blockUser();
    handleClose();
  }

  const handleUnblock = () => {
    unblockUser();
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${isAnimating ? 'animate-in fade-in' : 'animate-out fade-out'} duration-200`}>
      <div className={`bg-base-100 rounded-xl max-w-xs sm:max-w-md w-full shadow-xl overflow-hidden transform transition-all ${isAnimating ? 'scale-100' : 'scale-95'}`}>
        {/* Modal header */}
        <div className="bg-primary/90 p-4 sm:p-6 text-primary-content relative">
          <button
            onClick={handleClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 text-primary-content/80 hover:text-primary-content transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4 sm:size-5 cursor-pointer" />
          </button>

          {/* Avatar */}
          <div className="flex justify-center -mb-12 sm:-mb-14">
            <div className="relative">
              <img
                src={user.profilePic || "/profile.png"}
                alt={user.fullName}
                className="size-24 sm:size-28 bg-base-300 rounded-full object-cover border-4 border-base-100 shadow-md"
              />
              {isOnline && (
                <span className="absolute bottom-1 right-1 size-3 sm:size-4 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-6 pt-14 sm:pt-16 space-y-4 sm:space-y-6">
          {/* User identity */}
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-bold truncate">{user.fullName}</h3>
            <p className="text-sm sm:text-base text-base-content/70 truncate">@{user.username}</p>
          </div>

          {/* User Details */}
          <div className="space-y-3 sm:space-y-4 bg-base-200 rounded-lg p-3 sm:p-4">
            {/* Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-base-300 p-1.5 sm:p-2 rounded-full">
                <div className={`size-1.5 sm:size-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">Status</p>
                <p className="text-xs sm:text-sm text-base-content/70">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-base-300 p-1.5 sm:p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-3 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">Email</p>
                <p className="text-xs sm:text-sm text-base-content/70 truncate">{user.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-base-300 p-1.5 sm:p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-3 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">Member Since</p>
                <p className="text-xs sm:text-sm text-base-content/70 truncate">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 sm:pt-2 flex gap-3">
            <button
              className={`bg-primary hover:bg-primary-focus text-primary-content py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-1.5 ${!blocked ? 'w-1/2' : 'w-full'}`}
              onClick={handleClose}
            >
              <MessageSquare className="size-4" />
              <span>Send Message</span>
            </button>
            {!blocked ? (
              <button
                className="w-1/2 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-1.5"
                onClick={handleBlock}
              >
                <Ban className="size-4" />
                <span>Block User</span>
              </button>
            ) : blockedByUser && (
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-1.5"
                onClick={handleUnblock}
              >
                <Ban className="size-4" />
                <span>Unblock User</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;