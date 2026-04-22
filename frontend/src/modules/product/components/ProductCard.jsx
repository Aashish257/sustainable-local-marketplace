const ProductCard = ({ product }) => {
    return (
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                {/* Fallback image if product.images is empty */}
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400">No Image</span>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold truncate pr-2">{product.title}</h3>
                    <span className="text-lg font-bold text-green-600">${product.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 truncate">{product.description}</p>
                <div className="flex justify-between items-center text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.category}
                    </span>
                    {/* Sustainability Score */}
                    {product.sustainabilityScore && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                            🌱 {product.sustainabilityScore}/10
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
