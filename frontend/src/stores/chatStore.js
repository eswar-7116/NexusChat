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

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));