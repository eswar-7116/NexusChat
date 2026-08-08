import toast from "react-hot-toast";
import { axiosInstance } from "../../helpers/axios";

export const createUserSlice = (set, get) => ({
    allUsers: [],
    recentUsers: [],
    isFetchingUsers: false,
    selectedUser: null,
    blocked: false,
    blockedByUser: false,

    fetchAllUsers: async () => {
        try {
            const { data } = await axiosInstance.get("/messaging/get-users");
            if (data.success) set({ allUsers: data.users });
            else toast.error("Failed to get all users");
        } catch (error) {
            console.error("Error fetching users:", error?.response?.data?.message || error?.message);
            toast.error("Error while fetching all users");
        }
    },

    fetchRecentUsers: async () => {
        // Prevent duplicate fetches if already in progress
        if (get().isFetchingUsers) return;

        set({ isFetchingUsers: true });
        try {
            const { data } = await axiosInstance.get("/messaging/get-recent-users");
            if (data.success) set({ recentUsers: data.recentUsers });
            else toast.error("Failed to get recent users");
        } catch (error) {
            console.error("Error fetching recent users:", error?.response?.data?.message || error?.message);
            toast.error("Error while fetching recent users");
        } finally {
            set({ isFetchingUsers: false });
        }
    },

    setSelectedUser: async (selectedUser) => {
        set({ selectedUser });
        if (selectedUser) {
            try {
                const res = await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
                set({ blocked: res.data.blocked, blockedByUser: res.data.blockedByUser });
            } catch (error) {
                console.error("Error updating read status:", error?.response?.data?.message || error?.message);
                toast.error("Failed to update read status");
            }
        }
    },

    blockUser: async () => {
        try {
            const { blocked, selectedUser } = get();
            if (blocked || !selectedUser) return;

            const res = await axiosInstance.get(`/auth/block/${selectedUser._id}`);

            if (!res.data.success) {
                toast.error("Failed to block user");
                return;
            }

            set({ blocked: true, blockedByUser: true });
        } catch (error) {
            console.error("Failed to block user:", error?.response?.data?.message || error?.message);
            toast.error("Failed to block user");
        }
    },

    unblockUser: async () => {
        try {
            const { blocked, selectedUser } = get();
            if (!blocked || !selectedUser) return;

            const res = await axiosInstance.get(`/auth/unblock/${selectedUser._id}`);

            if (!res.data.success) {
                toast.error("Failed to unblock user");
                return;
            }

            set({ blocked: false, blockedByUser: false });
        } catch (error) {
            console.error("Failed to unblock user:", error?.response?.data?.message || error?.message);
            toast.error("Failed to unblock user");
        }
    },
});
