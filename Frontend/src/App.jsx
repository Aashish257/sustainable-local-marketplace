import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Products from './pages/Products';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
    <Footer />
    </>
  );
}