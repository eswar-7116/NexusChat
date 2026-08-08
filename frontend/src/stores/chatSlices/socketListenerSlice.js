import { useAuthStore } from "../authStore";

export const createSocketListenerSlice = (set, get) => ({
    stopListeningToSocket: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messagesRead");
        socket.off("deleteForMe");
        socket.off("deleteForEveryone");
    },
});
