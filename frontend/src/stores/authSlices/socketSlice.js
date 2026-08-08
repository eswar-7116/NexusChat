import { io } from 'socket.io-client';
import { axiosInstance } from '../../helpers/axios';
import { useChatStore } from '../chatStore';

export const replyNotification = new Audio("/notification.mp3");

export const createSocketSlice = (set, get) => ({
    onlineUsers: [],
    socket: null,

    connectSocket: () => {
        const { user, socket } = get();
        // If user is not logged in, return
        if (!user) return;

        // If socket is already connected, disconnect it
        if (socket?.connected)
            socket.disconnect();

        const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
            query: { userId: user._id }
        });
        newSocket.connect();

        // All socket event handlers
        newSocket.on('getOnlineUsers', (users) => {
            set({ onlineUsers: users });
        });

        newSocket.on('newMessage', async (message) => {
            const { selectedUser } = useChatStore.getState();
            const shouldNotify = message.senderId !== selectedUser?._id;

            // Vibrate if setting enabled
            if (get().canVibrate && "vibrate" in navigator) navigator.vibrate(120);

            // Play notification sound if the message is not from the selected user
            if (shouldNotify) {
                replyNotification.play().catch((err) =>
                    console.error("Notification sound error:", err)
                );
            }

            const { recentUsers, allUsers } = useChatStore.getState();

            // Update messages only if message is from currently selected user
            useChatStore.setState((state) => ({
                messages:
                    message.senderId === selectedUser?._id
                        ? [...state.messages, message]
                        : state.messages,
            }));

            // Mark messages as read
            if (selectedUser?._id === message.senderId) {
                try {
                    await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
                } catch (err) {
                    console.error("Error marking messages as read:", err?.message);
                }
            }

            // Get the sender from allUsers
            const sender = allUsers.find((user) => user._id === message.senderId);
            if (!sender) return;

            // Update recentUsers
            const updatedRecentUsers = [
                sender,
                ...recentUsers.filter((user) => user._id !== sender._id),
            ];

            useChatStore.setState({ recentUsers: updatedRecentUsers });
        });

        newSocket.on("messagesRead", (readByUserId) => {
            if (readByUserId === useChatStore.getState().selectedUser?._id) {
                const currentUserId = get().user._id;
                useChatStore.setState((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.senderId === currentUserId && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    )
                }));
            }
        });

        newSocket.on("deleteForMe", ({ msgId, deletedByUserId }) => {
            useChatStore.set((state) => ({
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

        newSocket.on("deleteForEveryone", ({ msgId, deletedByUserId }) => {
            useChatStore.set((state) => {
                const messages = [...state.messages];
                const msg = messages.find((m) => m._id === msgId);
                if (msg) msg.deletedForEveryoneBy = deletedByUserId;
                return { messages };
            });
        });

        newSocket.on("blocked", (blockedByUserId) => {
            if (useChatStore.getState().selectedUser?._id === blockedByUserId) {
                useChatStore.setState({ blocked: true });
            }
        });

        newSocket.on("unblocked", (blockedByUserId) => {
            if (useChatStore.getState().selectedUser?._id === blockedByUserId) {
                useChatStore.setState({ blocked: false });
            }
        });

        newSocket.on("userAdded", (user) => {
            useChatStore.setState({
                allUsers: [...useChatStore.getState().allUsers, user]
            });
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null });
        }
    }
});
