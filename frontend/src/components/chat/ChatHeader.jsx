import React from 'react';
import { useAuthStore } from '../../stores/authStore';

function ChatHeader({ selectedUser, onProfilePicClick }) {
  const { onlineUsers } = useAuthStore();

  const isUserOnline = onlineUsers.some(onlineUser => onlineUser === selectedUser._id);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Offline";

    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="p-2 border-b border-base-300 bg-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar with status dot */}
          <div className="avatar flex-shrink-0 transform transition-transform duration-300 hover:scale-110" onClick={onProfilePicClick}>
            <div className="size-8 sm:size-10 rounded-full relative cursor-pointer">
              <img src={selectedUser.profilePic || "/profile.png"} alt={selectedUser.fullName} />
            </div>
            {isUserOnline && (
              <span
                className="absolute bottom-0 right-0 size-2 sm:size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
              />
            )}
          </div>

          {/* User info with text truncation */}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate text-sm sm:text-base">
              {selectedUser.fullName}
            </h3>
            <p className="text-xs sm:text-sm text-base-content/70 truncate">
              {selectedUser.username}
            </p>
          </div>
        </div>

        {/* Last seen status - responsive */}
        <div className="text-xs sm:text-sm text-base-content/70 flex-shrink-0 ml-2 hidden sm:block">
          {isUserOnline ? "Online" : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
        </div>

        {/* Mobile-only indicator */}
        <div className="text-xs text-base-content/70 flex-shrink-0 ml-2 sm:hidden">
          {isUserOnline ? "Online" : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;