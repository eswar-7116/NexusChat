import { create } from "zustand";
import { createUserSlice } from "./chatSlices/userSlice";
import { createMessageSlice } from "./chatSlices/messageSlice";
import { createSocketListenerSlice } from "./chatSlices/socketListenerSlice";

export const useChatStore = create((set, get) => ({
    ...createUserSlice(set, get),
    ...createMessageSlice(set, get),
    ...createSocketListenerSlice(set, get),
}));