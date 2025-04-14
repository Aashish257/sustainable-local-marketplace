import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import 'tailwindcss';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error:", err));
  }, [id]);

  if (!product) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded" />
      <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
      <p className="text-green-700 font-semibold text-xl">₹{product.price}</p>
      <p className="mt-2 text-gray-600">{product.description}</p>

      {/* Optional: Add Bidding form here */}
      <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
        Place a Bid
      </button>
    </div>
  );
}
