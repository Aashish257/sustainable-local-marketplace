import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useCartStore } from "../modules/cart/store/cartStore";
import useNotificationStore from "./notificationStore";

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
            
            // Clear other stores
            useCartStore.getState().clearCart();
            useNotificationStore.getState().clearAll();
            
            set({ user: null, token: null, isAuthenticated: false });
        },
    }), {
        name: "auth-storage",
    })
)

export default useAuthStore;