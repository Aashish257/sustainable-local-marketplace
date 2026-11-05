// Created Api Client
import axios from "axios";
import { trackRequestStart, trackRequestEnd } from "./wakeNotice";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Long enough for a sleeping free-tier server to wake up (30–60 s)
    timeout: 70000,
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
    trackRequestStart();
    const storage = localStorage.getItem("auth-storage");
    if (storage) {
        try {
            const { state } = JSON.parse(storage);
            if (state && state.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
        } catch (e) {
            console.error("Failed to parse auth token", e);
        }
    }
    return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        trackRequestEnd();
        return response;
    },
    (error) => {
        trackRequestEnd();
        if (error.response?.status === 401) {
            localStorage.removeItem("auth-storage"); // Clean Zustand store
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
)

export default apiClient;
