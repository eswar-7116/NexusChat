import { axiosInstance } from '../../helpers/axios';
import { toast } from 'react-hot-toast';

export const createProfileSlice = (set, get) => ({
    theme: (() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved) return saved;
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    })(),
    canVibrate: localStorage.getItem("vibration") !== "false",
    isUpdatingProfilePic: false,

    changeTheme: () => {
        const theme = get().theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", theme);
        set({ theme });
    },

    toggleVibration: () => {
        const newCanVibrate = !get().canVibrate;
        localStorage.setItem("vibration", newCanVibrate);
        set({ canVibrate: newCanVibrate });
    },

    updateProfilePic: async (data) => {
        // Prevent multiple profile pic updates while one is in progress
        if (get().isUpdatingProfilePic) return;

        set({ isUpdatingProfilePic: true });
        try {
            const res = await axiosInstance.post('/auth/edit-profile', data);
            if (res.data.success) {
                set({ user: res.data.user });
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message || 'Profile pic update failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Profile pic update failed';
            console.error("Profile pic update error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isUpdatingProfilePic: false });
        }
    },
});
