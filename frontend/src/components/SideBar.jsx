import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

function SideBar() {
  const { onlineUsers } = useAuthStore();
  const { fetchUsers, users, selectedUser, setSelectedUser, isFetchingUsers } = useChatStore();

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const skeletonContacts = Array(8).fill(null);

  if (isFetchingUsers) {
    return (
      <aside
        className="h-full w-20 lg:w-72 border-r border-base-300
        flex flex-col transition-all duration-200"
      >
        {/* Users */}
        <div className="overflow-y-auto w-full py-3">
          {skeletonContacts.map((_, idx) => (
            <div key={idx} className="w-full p-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <div className="skeleton size-12 rounded-full" />
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
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-200 w-full p-5">
        <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-2 flex items-center gap-3
              hover:bg-base-200 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-200" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/profile.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User Info (Only visible on larger screens) */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
        </div>
      </div>
    </aside>
  )
}

export default SideBar;