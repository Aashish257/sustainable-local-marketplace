import { Link } from "react-router-dom";
import 'tailwindcss';

export default function Navbar() {
  return (
    <nav className="bg-green-700 text-white shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex-shrink-0 text-2xl font-bold tracking-wide">
          <Link to="/">FarmNest</Link>
        </div>

        {/* Center: Menu Items - Always visible */}
        <div className="flex justify-center aligne-center gap-2 ">
          <ul className=" list-none flex gap-2 p-4 m-6">
            <li className="hover:text-yellow-300 transition duration-200 p-4 m-4">
            <Link to="/" >Home</Link>
            </li>
            <li>
            <Link to="/products" className="hover:text-yellow-300 transition duration-200">Products</Link>
            </li>
            <li>
            <Link to="/admin" className="hover:text-yellow-300 transition duration-200">Admin</Link>
            </li>
            <li>
            <Link to="/contact" className="hover:text-yellow-300 transition duration-200">Contact</Link>
            </li>
            <li>
            <Link to="/bidding" className="hover:text-yellow-300 transition duration-200">Bidding</Link>
            </li>
          </ul>
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
