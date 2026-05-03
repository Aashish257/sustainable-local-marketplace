import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectSocket, disconnectSocket } from "../services/socket";

const useAuthStore = create(
    persist((set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: (user, token) => {
            connectSocket(token); // Connect socket on login
            set({ user, token, isAuthenticated: true });
        },
        logout: () => {
            disconnectSocket(); // Clean disconnect on logout
            set({ user: null, token: null, isAuthenticated: false });
        },
    }), {
        name: "auth-storage",
    })
)

export default useAuthStore;