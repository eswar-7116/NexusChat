import React from 'react';
import { useAuthStore } from '../stores/authStore';

function ChatHeader({ selectedUser, onProfilePicClick }) {
  const { onlineUsers } = useAuthStore();
  
  const isUserOnline = onlineUsers.some(onlineUser => onlineUser === selectedUser._id);
  
  return (
    <div className="p-2.5 border-b border-base-300 bg-base-300">
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-3">
          {/* Avatar with status dot */}
          <div className="avatar" onClick={onProfilePicClick}>
            <div className="size-10 rounded-full relative cursor-pointer">
              <img src={selectedUser.profilePic || "/profile.png"} alt={selectedUser.fullName} />
            </div>
            {isUserOnline && (
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
          {isUserOnline 
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
  );
}

export default ChatHeader;