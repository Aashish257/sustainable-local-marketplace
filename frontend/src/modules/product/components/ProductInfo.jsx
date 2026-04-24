const ProductInfo = ({ product }) => {
    return (
        <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {/* Category & Sustainability Score */}
            <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                </span>
                {product.sustainabilityScore && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        🌱 Score: {product.sustainabilityScore}/10
                    </span>
                )}
            </div>

            <p className="text-3xl font-bold text-green-600 mb-6">${product.price}</p>

            <div className="prose max-w-none text-gray-700 mb-8">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* If you have stock info in your schema, show it here */}
            {product.stock !== undefined && (
                <p className={`text-sm font-medium mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
            )}
        </div>
    );
};

export default ProductInfo;
