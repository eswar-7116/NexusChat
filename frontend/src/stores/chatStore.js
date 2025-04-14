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
    blocked: false,
    blockedByUser: false,

    fetchAllUsers: async () => {
        try {
            const { data } = await axiosInstance.get("/messaging/get-users");
            if (data.success) set({ allUsers: data.users });
            else toast.error("Failed to get all users");
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error while fetching all users");
        }
    },

    fetchRecentUsers: async () => {
        set({ isFetchingUsers: true });
        try {
            const { data } = await axiosInstance.get("/messaging/get-recent-users");
            if (data.success) set({ recentUsers: data.recentUsers });
            else toast.error("Failed to get recent users");
        } catch (error) {
            console.error("Error fetching recent users:", error);
            toast.error("Error while fetching recent users");
        } finally {
            set({ isFetchingUsers: false });
        }
    },

    fetchMessages: async (receiverId) => {
        set({ isFetchingMessages: true });
        try {
            const { data } = await axiosInstance.get(`/messaging/get-messages/${receiverId}`);
            if (data.success) set({ messages: data.messages });
            else toast.error("Failed to get messages");
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Error while fetching messages");
        } finally {
            set({ isFetchingMessages: false });
        }
    },

    sendMessage: async (data) => {
        try {
            const { selectedUser, messages, recentUsers } = get();
            const res = await axiosInstance.post(`/messaging/send/${selectedUser._id}`, data);

            if (!res.data.success) {
                toast.error("Failed to send message");
                return;
            }

            const newChat = res.data.chat;

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

            set({
                messages: [...messages, newChat],
                recentUsers: updatedRecentUsers
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error while sending message");
        }
    },

    listenToSocket: () => {
        const { selectedUser } = get();
        const { socket, canVibrate } = useAuthStore.getState();
        if (!selectedUser || !socket) return;

        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");
        socket.off("deleteForEveryone");

        socket.on("newMessage", async (message) => {
            if (canVibrate) navigator.vibrate(120);
            replyNotification.play().catch((err) =>
                console.error("Notification sound error:", err)
            );

            const { selectedUser } = get();

            // Update messages only if message is from currently selected user
            set((state) => ({
                messages:
                    message.senderId === selectedUser?._id
                        ? [...state.messages, message]
                        : state.messages,
            }));

            // Mark messages as read
            if (selectedUser?._id === message.senderId) {
                await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
            }
        });

        socket.on("messagesRead", (readByUserId) => {
            if (readByUserId === get().selectedUser?._id) {
                const currentUserId = useAuthStore.getState().user._id;
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.senderId === currentUserId && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    )
                }));
            }
        });

        socket.on("deleteForMe", ({ msgId, deletedByUserId }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
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

        socket.on("deleteForEveryone", ({ msgId, deletedByUserId }) => {
            set((state) => {
                const messages = [...state.messages];
                const msg = messages.find((m) => m._id === msgId);
                if (msg) msg.deletedForEveryoneBy = deletedByUserId;
                return { messages };
            });
        });
    },

    stopListeningToSocket: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");
        socket.off("deleteForEveryone");
    },

    setSelectedUser: async (selectedUser) => {
        set({ selectedUser });
        if (selectedUser) {
            const res = await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
            set({ blocked: res.data.blocked, blockedByUser: res.data.blockedByUser });
        }
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
            console.error("Error deleting message:", error);
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
            console.error("Error deleting message:", error);
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
            console.error("Failed to update message:", error);
            toast.error("Failed to update message");
        }
    },

    blockUser: async () => {
        try {
            const { blocked, selectedUser } = get();
            if (blocked) return;

            const res = await axiosInstance.get(`/auth/block/${selectedUser._id}`);

            if (!res.data.success) {
                toast.error("Failed to block user");
                return;
            }

            set({ blocked: true, blockedByUser: true });
        } catch (error) {
            console.error("Failed to block user:", error);
            toast.error("Failed to block user");
        }
    },

    unblockUser: async () => {
        try {
            const { blocked, selectedUser } = get();
            if (!blocked) return;

            const res = await axiosInstance.get(`/auth/unblock/${selectedUser._id}`);

            if (!res.data.success) {
                toast.error("Failed to unblock user");
                return;
            }

            set({ blocked: false, blockedByUser: false });
        } catch (error) {
            console.error("Failed to unblock user:", error);
            toast.error("Failed to unblock user");
        }
    }
}));