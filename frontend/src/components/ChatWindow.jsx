import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import Modal from './Modal';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

function ChatWindow() {
  const { selectedUser, messages, isFetchingMessages, sendMessage, listenToUser, stopListeningToUser } = useChatStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleProfilePicClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  React.useEffect(() => {
    listenToUser();

    return () => stopListeningToUser();
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
      <ChatInput sendMessage={handleSendMessage} />

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