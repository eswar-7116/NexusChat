import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { X } from 'lucide-react';

function ChatWindow() {
  const { user, onlineUsers } = useAuthStore();
  const { selectedUser } = useChatStore();

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Top bar */}
      <div className="p-2.5 border-b border-base-300 bg-base-300">
        <div className="flex items-center justify-between p-1">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/profile.png"} alt={selectedUser.fullName} />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Chat box */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        Chat Box
      </div>
    </div>
  )
}

export default ChatWindow;