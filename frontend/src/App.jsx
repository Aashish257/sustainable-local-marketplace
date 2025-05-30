import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
// import Products from "./pages/Products"
import Bidding from "./pages/Bidding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import AdminDashboard from "./pages/AdminDashboard"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/bidding"
          element={
            <ProtectedRoute>
              <Bidding />
            </ProtectedRoute>
          }
        />

        {/* Example: Admin Only */}
        {/* 
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> 
        */}

      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
