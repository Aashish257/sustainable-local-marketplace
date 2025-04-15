import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:scale-105 transition">
      <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
      <h2 className="mt-2 text-lg font-bold">{product.name}</h2>
      <p className="text-green-600 font-semibold">₹{product.price}</p>
      <Link
        to={`/products/${product._id}`}
        className="text-sm text-blue-500 underline mt-2 inline-block"
      >
        View Details
      </Link>
    </div>
  );
}
