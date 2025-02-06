import React from 'react';
import { useChatStore } from '../stores/chatStore';
import SideBar from '../components/SideBar';
import ChatWindow from '../components/ChatWindow';
import NoUserSelected from '../components/NoUserSelected';

function HomePage() {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-[calc(100vh-4.5rem)] bg-base-200 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-full flex overflow-hidden">
        <SideBar />
        {selectedUser ? <ChatWindow /> : <NoUserSelected />}
      </div>
    </div>
  );
}

export default HomePage;
