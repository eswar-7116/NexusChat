import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { Users } from 'lucide-react';

function SideBar() {
  const { onlineUsers } = useAuthStore();
  const { fetchUsers, users, selectedUser, setSelectedUser, isFetchingUsers, fetchMessages } = useChatStore();

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const skeletonContacts = Array(8).fill(null);

  if (isFetchingUsers) {
    return (
      <aside
        className="h-full w-16 sm:w-20 lg:w-72 border-r border-base-300
        flex flex-col transition-all duration-200"
      >
        {/* Users */}
        <div className="overflow-y-auto w-full py-2 sm:py-3">
          {skeletonContacts.map((_, idx) => (
            <div key={idx} className="w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <div className="skeleton size-10 sm:size-12 lg:size-12 rounded-full" />
              </div>
              {/* User Info (Only visible on larger screens) */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-16 sm:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="w-full">
        {/* Header (Only visible on large screens) */}
        <div className="flex items-center justify-center lg:justify-start px-5 pt-3 pb-2">
          <Users className="size-6 text-base-content/70" />
          <span className="hidden lg:block ml-2 font-semibold text-base-content/70">Contacts</span>
        </div>

        <div className="overflow-y-auto w-full py-2 px-1 sm:px-2 lg:px-3">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                fetchMessages(user._id);
              }}
              className={`
                w-full py-2 px-1 sm:px-2 mb-1 rounded-lg flex items-center gap-2 sm:gap-3
                hover:bg-base-200 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/profile.png"}
                  alt={user.fullName}
                  className="size-10 sm:size-12 lg:size-12 rounded-full object-cover"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-2.5 sm:size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>
              {/* User Info (Only visible on larger screens) */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400 truncate">
                  {user.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;