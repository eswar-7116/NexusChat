import React from 'react';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

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
  }, [isCollapsed]);

  React.useEffect(() => {
    fetchRecentUsers();
    fetchAllUsers();

    const handleResize = () => {
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.9;
      if (!isKeyboardOpen) {
        setIsCollapsed(window.innerWidth < 768);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchRecentUsers, fetchAllUsers]);

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return recentUsers;

    const lowercaseQuery = searchQuery.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.fullName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }, [searchQuery, allUsers, recentUsers]);

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
    setIsCollapsed(window.innerWidth < 768);
  };

  if (isFetchingUsers) {
    return (
      <aside className={`
        h-full border-r border-base-300 flex flex-col transition-all duration-300
        ${isCollapsed ? 'w-16 md:w-20' : 'w-full sm:w-69'}
        relative bg-base-100
      `}>
        {/* Skeleton Loading State */}
        <div className="overflow-y-auto w-full py-2">
          {Array(8).fill(null).map((_, idx) => (
            <div key={idx} className="w-full p-2 flex items-center gap-2">
              <div className="skeleton size-10 rounded-full" />
              {!isCollapsed && (
                <div className="flex-1">
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
    <aside className={`
      h-full border-r border-base-300 flex flex-col transition-all duration-300
      ${isCollapsed ? 'w-16 md:w-20' : 'w-full sm:w-69'}
      relative bg-base-100
    `}>
      {/* Desktop Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 
        bg-base-100 border border-base-300 rounded-full p-1 
        shadow-md z-10 hidden md:flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      {/* Mobile Header */}
      <div className={`md:hidden flex items-center p-2 border-b border-base-300 ${!isCollapsed && "w-screen"} ${isCollapsed && "justify-center"}`}>
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed)
          }}
          className="flex items-center"
        >
          <Users className="size-5" />
          {!isCollapsed && <span className="ml-2">Contacts</span>}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-2 py-2 relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-8 rounded-lg bg-base-200 
            border border-base-300 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
          text-zinc-400 size-4" />
        </div>
      )}

      {/* Contact List */}
      <div className="overflow-y-auto flex-1 py-2 px-1">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`
                w-full py-2 px-2 mb-1 rounded-lg flex items-center 
                hover:bg-base-200 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/profile.png"}
                  alt={user.fullName}
                  className="size-10 rounded-full object-cover"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-2.5 
                    bg-green-500 rounded-full ring-2 ring-base-100"
                  />
                )}
              </div>
              {!isCollapsed && (
                <div className="ml-3 text-left min-w-0 flex-1">
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
    </aside>
  );
}

export default SideBar;