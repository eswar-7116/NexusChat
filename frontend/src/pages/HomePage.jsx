import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import SideBar from '../components/layout/SideBar';
import ChatWindow from '../components/chat/ChatWindow';
import NoUserSelected from '../components/layout/NoUserSelected';

function HomePage() {
  const { selectedUser, setSelectedUser } = useChatStore();

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      event.stopPropagation();
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.title = 'NexusChat'
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
