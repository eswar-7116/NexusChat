import React from 'react';
import { useChatStore } from '../stores/chatStore';
import SideBar from '../components/SideBar';
import ChatWindow from '../components/ChatWindow';
import NoUserSelected from '../components/NoUserSelected';

function HomePage() {
  const { selectedUser, setSelectedUser } = useChatStore();

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setSelectedUser(null);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-[calc(100vh-4.5rem)] bg-base-200 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-full flex overflow-hidden border border-base-300">
        <SideBar />
        {selectedUser ? <ChatWindow /> : <NoUserSelected />}
      </div>
    </div>
  );
}

export default HomePage;
