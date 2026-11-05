import Router from "./app/Router";
import Navbar from "./shared/layout/Navbar";
import Footer from "./shared/layout/Footer";
import { useEffect } from "react";
import { connectSocket } from "./services/socket";
import socket from "./services/socket";
import useNotificationStore from "./store/notificationStore";
import useAuthStore from "./store/authStore";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";

// Pages that should NOT show the footer
const NO_FOOTER_PATHS = ['/login', '/register', '/dashboard', '/admin'];

const AppContent = () => {
  const location = useLocation();
  const showFooter = !NO_FOOTER_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            borderRadius: '12px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
          },
        }}
      />
      <Navbar />
      <Router />
      {showFooter && <Footer />}
    </>
  );
};

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
      // Server sends the saved document (with _id), so read state can sync back
      useNotificationStore.getState().addNotification({ type: "system", link: "/", ...data });
    };

    socket.on("notification", handleNotification);

    // CLEANUP: prevent duplicate listeners on re-renders
    return () => {
      socket.off("notification", handleNotification);
    };
  }, []); // [] = run once on mount, socket is a singleton not React state

  // Load saved notifications when a user is logged in; clear them on logout
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    const store = useNotificationStore.getState();
    if (isAuthenticated) store.fetchNotifications();
    else store.reset();
  }, [isAuthenticated]);

  return <AppContent />;
}

export default App;
