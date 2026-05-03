import Router from "./app/Router";
import Navbar from "./shared/layout/Navbar";
import { useEffect } from "react";
import { connectSocket } from "./services/socket";

function App() {

  // Reconnect socket on page refresh if user has a saved token
  useEffect(() => {
    const storage = localStorage.getItem("auth-storage");
    if (storage) {
      try {
        const token = JSON.parse(storage).state?.token;
        if (token) connectSocket(token);
      } catch (e) {}
    }
  }, []);

  return (
    <>
      <Navbar />
      <Router />
    </>

  )
}

export default App
