import { Link } from 'react-router-dom'
import 'tailwindcss';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-ecoGreen">🌿 LOO</Link>
      <ul className="flex gap-6 text-gray-700 font-medium">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/bidding">Bidding</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/services">Services</Link></li>
      </ul>
      <div className="flex gap-4">
        <Link to="/login" className="text-ecoGreen font-semibold">Login</Link>
        <Link to="/signup" className="bg-ecoGreen text-white px-4 py-2 rounded-md">Sign Up</Link>
      </div>
    </nav>
  )
}

export default Navbar;
