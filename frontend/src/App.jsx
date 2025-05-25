import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home"
// import Products from "./pages/Products"
import Bidding from "./pages/Bidding"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
// import AdminDashboard from "./pages/AdminDashboard"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

function App() {
  return (
    <>
      <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/products" element={<Products />} /> */}
            <Route path="/bidding" element={<Bidding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          </Routes>
          <Footer />
      </AuthProvider>
    </>
  )
}

export default App
