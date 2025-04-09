import { Link } from "react-router-dom";
import "tailwindcss";

export default function Navbar() {
  return (
    <nav className="bg-green-600 text-black p-4 flex justify-between">
      <div className="font-bold">FarmNest</div>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/admin">Admin</Link>
      </div>
    </nav>
  );
}
