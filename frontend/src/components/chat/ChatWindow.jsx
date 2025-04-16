import React from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Modal from '../Modal';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Ban } from 'lucide-react';

function ChatWindow() {
  const { blocked, blockedByUser, selectedUser, messages, isFetchingMessages, sendMessage, listenToSocket, stopListeningToSocket } = useChatStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleProfilePicClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  React.useEffect(() => {
    listenToSocket();

    return () => stopListeningToSocket();
  }, [selectedUser?._id]);

  const handleSendMessage = async (messageData) => {
    await sendMessage(messageData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Top bar */}
      <ChatHeader 
        selectedUser={selectedUser}
        onProfilePicClick={handleProfilePicClick}
      />

      {/* Chat Box */}
      <ChatMessages 
        messages={messages}
        isFetchingMessages={isFetchingMessages}
      />

      {/* Message input */}
      {blocked ? (
        <div className="p-3 bg-base-200 border-t border-base-300 flex items-center justify-center">
          <Ban color='grey' />
          <p className='m-2 text-gray-400'>Blocked by {blockedByUser ? "You" : selectedUser.fullName}</p>
        </div>
      ) : (<ChatInput sendMessage={handleSendMessage} />)}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        isOnline={useAuthStore().onlineUsers.some(onlineUser => onlineUser === selectedUser._id)}
      />
    </div>
  );
}

export default ChatWindow;