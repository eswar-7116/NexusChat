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
            set({ users: res.data.users });
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
            set({ messages: res.data.messages });
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
            set({ messages: [...messages, res.data.chat] });
        } catch (error) {
            console.log("Error while sending message:", error);
            toast.error("Error while sending message");
        }
    },

    listenToUser: () => {
        const { selectedUser, messages } = get();
        console.log(messages)
        const { socket } = useAuthStore.getState();
        if (!selectedUser || !socket) return;

        socket.on("newMessage", (message) => {
            const isMessageSentFromSelectedUser = message.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set((state) => ({
                messages: [...state.messages, message]
            }));
        });
    },

    stopListeningToUser: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;

        socket.off("newMessage");
    },    

    setSelectedUser: async (selectedUser) => set({ selectedUser })
}));