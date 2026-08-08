import toast from "react-hot-toast";
import { axiosInstance } from "../../helpers/axios";
import { useAuthStore } from "../authStore";

export const createMessageSlice = (set, get) => ({
    messages: [],
    pendingMessages: [],
    failedMessages: [],
    isFetchingMessages: false,

    fetchMessages: async (receiverId) => {
        // Prevent duplicate fetches if already in progress
        if (get().isFetchingMessages) return;

        set({ isFetchingMessages: true });
        try {
            const { data } = await axiosInstance.get(`/messaging/get-messages/${receiverId}`);
            if (data.success) set({ messages: data.messages });
            else toast.error("Failed to get messages");
        } catch (error) {
            console.error("Error fetching messages:", error?.response?.data?.message || error?.message);
            toast.error("Error while fetching messages");
        } finally {
            set({ isFetchingMessages: false });
        }
    },

    sendMessage: async (data) => {
        try {
            const { selectedUser, messages, recentUsers, pendingMessages, failedMessages } = get();

            if (!selectedUser) {
                toast.error("No user selected");
                return;
            }

            // Generate a temporary ID for the pending message
            const tempId = `temp-${Date.now()}`;

            // Create the pending message object
            const pendingMessage = {
                _id: tempId,
                senderId: useAuthStore.getState().user._id,
                receiverId: selectedUser._id,
                content: data.message,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            // Add to pending messages
            set({
                pendingMessages: [...pendingMessages, pendingMessage],
                // If this was a retry, remove from failed messages
                failedMessages: failedMessages.filter(msg => msg._id !== pendingMessage._id)
            });

            // Send to server
            const res = await axiosInstance.post(`/messaging/send/${selectedUser._id}`, data);

            if (!res.data.success) {
                // Move from pending to failed
                set({
                    pendingMessages: pendingMessages.filter(msg => msg._id !== tempId),
                    failedMessages: [...failedMessages, { ...pendingMessage, status: 'failed' }]
                });
                toast.error("Failed to send message");
                return;
            }

            const newChat = res.data.chat;

            // Update recent users list
            const isAlreadyPresent = recentUsers.some(user => user._id === selectedUser._id);
            let updatedRecentUsers;

            if (!isAlreadyPresent) {
                updatedRecentUsers = [selectedUser, ...recentUsers];
            } else {
                updatedRecentUsers = [
                    selectedUser,
                    ...recentUsers.filter(user => user._id !== selectedUser._id)
                ];
            }

            // Remove from pending and add to messages
            set({
                messages: [...messages, newChat],
                recentUsers: updatedRecentUsers,
                pendingMessages: pendingMessages.filter(msg => msg._id !== tempId),
                failedMessages: failedMessages.filter(msg => msg._id !== tempId)
            });
        } catch (error) {
            console.error("Error sending message:", error?.response?.data?.message || error?.message);

            // Find the pending message and mark it as failed
            const { pendingMessages, failedMessages } = get();
            const failedMsg = pendingMessages.find(msg => msg.content === data.message);

            if (failedMsg) {
                set({
                    pendingMessages: pendingMessages.filter(msg => msg._id !== failedMsg._id),
                    failedMessages: [...failedMessages, { ...failedMsg, status: 'failed' }]
                });
            }

            toast.error("Error while sending message");
        }
    },

    // Retry sending failed messages
    retryMessage: async (failedMessage) => {
        const { failedMessages } = get();

        // Remove from the failed messages list
        set({
            failedMessages: failedMessages.filter(msg => msg._id !== failedMessage._id)
        });

        // Try sending again
        await get().sendMessage({
            message: failedMessage.content
        });
    },

    deleteForMe: async (msgId, msgIdx) => {
        try {
            const { data } = await axiosInstance.put(`/messaging/delete-for-me/${msgId}`);
            if (!data.success) {
                toast.error("Failed to delete message");
                return;
            }
            toast.success("Deleted the message for you");

            set((state) => {
                const messages = [...state.messages];
                messages.splice(msgIdx, 1);
                return { messages };
            });
        } catch (error) {
            console.error("Error deleting message:", error?.response?.data?.message || error?.message);
            toast.error("Unable to delete the message");
        }
    },

    deleteMessageForEveryone: async (messageId) => {
        try {
            const res = await axiosInstance.put(`/messaging/delete-for-everyone/${messageId}`);
            if (!res.data.success) {
                toast.error("Failed to delete message");
                return;
            }

            toast.success("Deleted the message for everyone");

            set((state) => {
                const messages = [...state.messages];
                const msg = messages.find((m) => m._id === messageId);
                if (msg) msg.deletedForEveryoneBy = useAuthStore.getState().user._id;
                return { messages };
            });
        } catch (error) {
            console.error("Error deleting message:", error?.response?.data?.message || error?.message);
            toast.error("Unable to delete the message");
        }
    },

    updateMessage: async (messageId, content) => {
        try {
            const res = await axiosInstance.put(`/messaging/edit/${messageId}`, {
                newContent: content
            });

            if (!res.data.success) {
                toast.error("Failed to update message");
                return;
            }

            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === messageId ? { ...msg, content, edited: true } : msg
                )
            }));
        } catch (error) {
            console.error("Failed to update message:", error?.response?.data?.message || error?.message);
            toast.error("Failed to update message");
        }
    },
});
