import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { Users, ChevronRight, ChevronLeft } from 'lucide-react';

function SideBar() {
  const { onlineUsers } = useAuthStore();
  const {
    fetchAllUsers,
    fetchRecentUsers,
    allUsers,
    recentUsers,
    selectedUser,
    setSelectedUser,
    isFetchingUsers,
    fetchMessages
  } = useChatStore();
  const [isCollapsed, setIsCollapsed] = React.useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchRecentUsers();
    fetchAllUsers(); // Ensure all users are loaded for search

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchRecentUsers, fetchAllUsers]);

  const skeletonContacts = Array(8).fill(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return recentUsers;

    const lowercaseQuery = searchQuery.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.fullName.toLowerCase().includes(lowercaseQuery)
    );
  }, [searchQuery, allUsers, recentUsers]);

  // Sort users: online first, then by search relevance or recency
  const sortedUsers = React.useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aIsOnline = onlineUsers.includes(a._id);
      const bIsOnline = onlineUsers.includes(b._id);

      if (aIsOnline && !bIsOnline) return -1;
      if (!aIsOnline && bIsOnline) return 1;
      return 0;
    });
  }, [filteredUsers, onlineUsers]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
    // On mobile, collapse the sidebar after selection
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  if (isFetchingUsers) {
    return (
      <aside
        className={`h-full border-r border-base-300 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'} relative`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-base-100 border border-base-300 rounded-full p-1 shadow-md z-10 md:flex hidden"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        {/* Users */}
        <div className="overflow-y-auto w-full py-2 sm:py-3">
          {skeletonContacts.map((_, idx) => (
            <div key={idx} className="w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <div className="skeleton size-10 rounded-full" />
              </div>
              {/* User Info (Only visible when expanded) */}
              {!isCollapsed && (
                <div className="text-left min-w-0 flex-1">
                  <div className="skeleton h-4 w-32 mb-2" />
                  <div className="skeleton h-3 w-16" />
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`h-full border-r border-base-300 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-18' : 'w-72'} relative`}
    >
      {/* Toggle button - visible on large screens */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-base-100 border border-base-300 rounded-full p-1 shadow-md z-10 md:flex hidden"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>

      {/* Mobile toggle - visible at top of sidebar on small screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden flex items-center justify-center p-2 w-full border-b border-base-300"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Users className="size-5" />
        {!isCollapsed && <span className="ml-2">Contacts</span>}
      </button>

      <div className="w-full flex-1 overflow-hidden flex flex-col">
        {/* Search input (visible when not collapsed) */}
        {!isCollapsed && (
          <div className="px-2 sm:px-3 py-2">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-base-200 border border-base-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="overflow-y-auto w-full flex-1 py-2 px-1 sm:px-2">
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user) => (
              <button
                key={`user-${user._id}`}
                onClick={() => handleUserSelect(user)}
                className={`
                  w-full py-2 px-1 sm:px-2 mb-1 rounded-lg flex items-center gap-2 sm:gap-3
                  hover:bg-base-200 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-300" : ""}
                `}
              >
                {/* Existing user rendering code remains the same */}
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/profile.png"}
                    alt={user.fullName}
                    className="size-10 rounded-full object-cover"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>
                {/* User Info (Only visible when expanded) */}
                {!isCollapsed && (
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400 truncate">
                      {user.username}
                    </div>
                  </div>
                )}
              </button>
            ))
          ) : (
            !isCollapsed && (
              <div className="text-center text-zinc-400 py-4">
                No users found
              </div>
            )
          )}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;