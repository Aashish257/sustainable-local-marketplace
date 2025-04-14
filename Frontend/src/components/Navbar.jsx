import { Link } from "react-router-dom";
import "tailwindcss";

export default function Navbar() {
  return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        
        {/* Logo / Brand */}
        <div className="text-2xl font-bold tracking-wide">FarmNest</div>

        {/* Navigation Links - visible on all screen sizes */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link to="/" className="hover:text-yellow-300 transition duration-200">Home</Link>
          <Link to="/products" className="hover:text-yellow-300 transition duration-200">Products</Link>
          <Link to="/admin" className="hover:text-yellow-300 transition duration-200">Admin</Link>
          <Link to="/contact" className="hover:text-yellow-300 transition duration-200">Contact</Link>
          <Link to="/bidding" className="hover:text-yellow-300 transition duration-200">Bidding</Link>
        </div>

        {/* Search Input */}
        <div className="flex justify-end items-center">
          <input
            type="search"
            placeholder="Search..."
            className="px-4 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>
    </nav>
  );
}
