import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../helpers/axios";
import { useAuthStore } from "./authStore";

export const replyNotification = new Audio("/notification.mp3");

export const useChatStore = create((set, get) => ({
    messages: [],
    allUsers: [],
    recentUsers: [],
    isFetchingUsers: false,
    isFetchingMessages: false,
    selectedUser: null,

    fetchAllUsers: async () => {
        try {
            const res = await axiosInstance.get("/messaging/get-users");
            if (res.data.success) {
                set({ allUsers: res.data.users });
            } else {
                toast.error("Failed to get all users");
            }
        } catch (error) {
            console.log("Error while fetching all users:", error);
            toast.error("Error while fetching all users");
        }
    },

    fetchRecentUsers: async () => {
        set({ isFetchingUsers: true });
        try {
            const res = await axiosInstance.get(`/messaging/get-recent-users`);
            if (res.data.success) {
                set({ recentUsers: res.data.recentUsers });
            } else {
                toast.error("Failed to get recent users");
            }
        } catch (error) {
            console.log("Error while fetching recent users:", error);
            toast.error("Error while fetching users");
        } finally {
            set({ isFetchingUsers: false });
        }
    },

    fetchMessages: async (receiverId) => {
        set({ isFetchingMessages: true });
        try {
            const res = await axiosInstance.get(`/messaging/get-messages/${receiverId}`);
            if (res.data.success) {
                set({ messages: res.data.messages });
            } else {
                toast.error("Failed to get messages");
            }
        } catch (error) {
            console.log("Error while fetching messages:", error);
            toast.error("Error while fetching messages");
        } finally {
            set({ isFetchingMessages: false });
        }
    },

    sendMessage: async (data) => {
        try {
            const { selectedUser, messages, recentUsers, allUsers } = get();
            const res = await axiosInstance.post(`/messaging/send/${selectedUser._id}`, data);
            
            if (res.data.success) {
                const newChat = res.data.chat;
                const receiverId = newChat.receiverId;
    
                // Check if the user is already in recent users
                const existingUserIndex = recentUsers.findIndex(user => user._id === receiverId);
    
                let updatedRecentUsers;
                if (existingUserIndex === -1) {
                    // Find user in allUsers
                    const newUser = allUsers.find(user => user._id === receiverId);
                    updatedRecentUsers = newUser ? [newUser, ...recentUsers] : recentUsers;
                } else {
                    updatedRecentUsers = recentUsers;
                }
    
                set({
                    messages: [...messages, newChat],
                    recentUsers: updatedRecentUsers
                });
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.log("Error while sending message:", error);
            toast.error("Error while sending message");
        }
    },

    listenToUser: () => {
        const { selectedUser } = get();
        const authStore = useAuthStore.getState();
        const socket = authStore.socket;
        if (!selectedUser || !socket) return;

        // Remove previous listeners to prevent duplicates
        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");
        socket.off("deleteForEveryone");

        // Listen for new messages
        socket.on("newMessage", async (message) => {
            console.log("New Message");
            // Vibrate
            if (useAuthStore.getState().canVibrate) {
                navigator.vibrate(120);
            }

            // Notify with sound when app is not on focus
            replyNotification.play().catch((error) => console.error("Error playing reply notification:", error));

            const isMessageSentFromSelectedUser = message.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set((state) => ({
                messages: [...state.messages, message]
            }));

            if (message.senderId === selectedUser._id) {
                await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
            }
        });

        // Listen if new messages are read
        socket.on("messagesRead", (readByUserId) => {
            const currentUserId = authStore.user._id;

            if (readByUserId === get().selectedUser._id) {
                set((state) => ({
                    messages: state.messages.map(msg =>
                        msg.senderId === currentUserId && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    )
                }));
            }
        });

        // Listen if the other user deleted the msg for himself
        socket.on("deleteForMe", (data) => {
            const { msgId, deletedByUserId } = data;
            set((state) => ({
                messages: state.messages.map(msg =>
                    msg._id === msgId
                        ? {
                            ...msg,
                            deletedFor: msg.deletedFor
                                ? [...msg.deletedFor, deletedByUserId]
                                : [deletedByUserId]
                        }
                        : msg
                )
            }));
        });

        socket.on("deleteForEveryone", (data) => {
            console.log("Received delete for everyone");
            const { msgId, deletedByUserId } = data;
            set((state) => {
                const messages = [...state.messages];
                const messageToUpdate = messages.find(msg => msg._id === msgId);
                if (messageToUpdate) {
                    messageToUpdate.deletedForEveryoneBy = deletedByUserId;
                }
                return { messages };
            });
        });
    },

    stopListeningToUser: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;

        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");
        socket.off("deleteForEveryone");
    },

    setSelectedUser: async (selectedUser) => {
        set({ selectedUser });
        await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
    },

    deleteForMe: async (msgId, msgIdx) => {
        try {
            const res = await axiosInstance.put(`/messaging/delete-for-me/${msgId}`);
            if (res.data.success) {
                toast.success("Deleted the message for you");
                
                set((state) => {
                    const messages = [...state.messages];
                    messages.splice(msgIdx, 1); // Remove the message at the given index
                    return { messages };
                });
            } else {
                toast.error("Failed to get messages");
            }
        } catch (error) {
            console.log("Error while deleting for you:", error);
            toast.error("Unable to delete the message");
        }
    },

    deleteMessageForEveryone: async (messageId) => {
        try {
            const res = await axiosInstance.put(`/messaging/delete-for-everyone/${messageId}`);
            if (res.data.success) {
                toast.success("Deleted the message for everyone");
    
                set((state) => {
                    const messages = [...state.messages];
                    const messageToUpdate = messages.find(msg => msg._id === messageId);
                    if (messageToUpdate) {
                        messageToUpdate.deletedForEveryoneBy = useAuthStore.getState().user._id;
                    }
                    return { messages };
                });
            } else {
                toast.error("Failed to delete message");
            }
        } catch (error) {
            console.log("Error while deleting for everyone:", error);
            toast.error("Unable to delete the message");
        }
    }
}));