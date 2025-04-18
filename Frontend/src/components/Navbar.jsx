import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state

  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
  };


  return (
    <div className="flex-shrink-0 w-[100vw] h-[60px] flex justify-between items-center px-8 shadow-md px-[30px]">
      <div className="w-full flex justify-between items-center mx-10">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="no-underline">
            <p className="text-2xl font-extrabold text-orange-600">
              Thala <span className="text-blue-600">7.</span>
            </p>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="menu-item">
          <ul className="list-none flex">
            <li className="mx-[15px] text-gray-500 text-base cursor-pointer hover:text-orange-600 transition-colors duration-300">
              <Link to="/">Home</Link>
            </li>
            <li className="mx-[15px] text-gray-500 text-base cursor-pointer hover:text-orange-600 transition-colors duration-300">
              <Link to="/Admin">About</Link>
            </li>
            <li className="mx-[15px] text-gray-500 text-base cursor-pointer hover:text-orange-600 transition-colors duration-300">
              <Link to="/Login">Brands</Link>
            </li>
            <li className="mx-[15px] text-gray-500 text-base cursor-pointer hover:text-orange-600 transition-colors duration-300">
              <Link to="/Product">More</Link>
            </li>
            <li className="mx-[15px] text-gray-500 text-base cursor-pointer hover:text-orange-600 transition-colors duration-300">
              <Link to="/ProductDetail">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">          
        <button
          onClick={handleAuth}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-1.5 px-4 rounded transition duration-300"
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
