import { Link } from 'react-router-dom';
import { memo } from 'react';

const ProductCard = memo(({ product }) => {
    return (
        <Link to={`/products/${product._id}`} className="block group">
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 bg-white hover:-translate-y-1">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-gray-300 text-5xl">📦</span>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-semibold text-gray-800 truncate pr-2">{product.title}</h3>
                        <span className="text-base font-bold text-green-600 flex-shrink-0">₹{product.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 truncate">{product.description}</p>
                    <div className="flex justify-between items-center text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                            {product.category}
                        </span>
                        {product.sustainabilityScore && (
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                                🌱 {product.sustainabilityScore}/10
                            </span>
                        )}
                    </div>
                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}</span>
                            <span className="text-xs text-gray-400">({product.totalReviews})</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

