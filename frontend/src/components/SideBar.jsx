import React from 'react';
import { useChatStore } from '../stores/chatStore';

function SideBar() {
  const { fetchUsers, users, selectedUser, isSelectedUser, isFetchingUsers } = useChatStore();

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <aside>
      {/*  */}
    </aside>
  )
}

export default SideBar;