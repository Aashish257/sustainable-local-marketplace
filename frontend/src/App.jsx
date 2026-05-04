import Router from "./app/Router";
import Navbar from "./shared/layout/Navbar";
import { useEffect } from "react";
import { connectSocket } from "./services/socket";
import socket from "./services/socket";
import useNotificationStore from "./store/notificationStore";
import { Toaster } from "react-hot-toast";

function App() {

  // Reconnect socket on page refresh if user has a saved token
  useEffect(() => {
    const storage = localStorage.getItem("auth-storage");
    if (storage) {
      try {
        const token = JSON.parse(storage).state?.token;
        if (token) connectSocket(token);
      } catch (e) { }
    }
  }, []);

  // Register global notification listener — runs ONCE on mount
  useEffect(() => {
    const handleNotification = (data) => {
      useNotificationStore.getState().addNotification({
        type: data.type || "info",
        message: data.message,
        link: data.link || "/",
      });
    };

    socket.on("notification", handleNotification);

    // CLEANUP: prevent duplicate listeners on re-renders
    return () => {
      socket.off("notification", handleNotification);
    };
  }, []); // [] = run once on mount, socket is a singleton not React state


  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <Router />
    </>
  )
}

export default App
