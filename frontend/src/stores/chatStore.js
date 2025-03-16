import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../helpers/axios";
import { useAuthStore } from "./authStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    isFetchingUsers: false,
    isFetchingMessages: false,
    selectedUser: null,

    fetchUsers: async () => {
        set({ isFetchingUsers: true });
        try {
            const res = await axiosInstance.get("/messaging/get-users");
            if (res.data.success) {
                set({ users: res.data.users });
            } else {
                toast.error("Failed to get messages");
            }
        } catch (error) {
            console.log("Error while fetching users:", error);
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
            const { selectedUser, messages } = get();
            const res = await axiosInstance.post(`/messaging/send/${selectedUser._id}`, data);
            if (res.data.success) {
                set({ messages: [...messages, res.data.chat] });
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
        const { socket } = useAuthStore.getState();
        if (!selectedUser || !socket) return;

        // Remove previous listeners to prevent duplicates
        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");

        // Listen for new messages
        socket.on("newMessage", async (message) => {
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
            console.log("Messages read by:", readByUserId);
            const currentUserId = useAuthStore.getState().user._id;

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
    },

    stopListeningToUser: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;

        socket.off("newMessage");
        socket.off("messagesRead");
    },

    setSelectedUser: async (selectedUser) => {
        set({ selectedUser });
        await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
    },

    deleteForMe: async (msgId) => {
        try {
            const res = await axiosInstance.put(`/messaging/delete-for-me/${msgId}`);
            if (res.data.success) {
                toast.success("Deleted the message for you")
            } else {
                toast.error("Failed to get messages");
            }
        } catch (error) {
            console.log("Error while deleting for you:", error);
            toast.error("Error while deleting for you");
        }
    },

    removeMessageAt: (messageIdx) => {
        set((state) => {
            const messages = [...state.messages];
            messages.splice(messageIdx, 1); // Remove the message at the given index
            return { messages };
        });
    }
}));