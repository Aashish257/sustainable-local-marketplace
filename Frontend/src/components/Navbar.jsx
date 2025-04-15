import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-green-700 text-white shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex-shrink-0 text-2xl font-bold tracking-wide">
          <Link to="/">FarmNest</Link>
        </div>

        {/* Center: Menu Items - Always visible */}
        <div className="flex-1 flex justify-center space-x-6 text-lg">
          <Link to="/" className="hover:text-yellow-300 transition duration-200">Home</Link>
          <Link to="/products" className="hover:text-yellow-300 transition duration-200">Products</Link>
          <Link to="/admin" className="hover:text-yellow-300 transition duration-200">Admin</Link>
          <Link to="/contact" className="hover:text-yellow-300 transition duration-200">Contact</Link>
          <Link to="/bidding" className="hover:text-yellow-300 transition duration-200">Bidding</Link>
        </div>

        {/* Right: Search Bar */}
        <div className="w-36 md:w-64">
          <input
            type="search"
            placeholder="Search..."
            className="w-full px-4 py-1 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>
    </nav>
  );
}
