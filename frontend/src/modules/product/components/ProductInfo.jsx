import StarRating from '../../review/components/StarRating';

const ProductInfo = ({ product }) => {
    return (
        <div className="flex flex-col">
            <h1 className="text-4xl font-black mb-3 text-slate-800 tracking-tight leading-tight">{product.title}</h1>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-3 mb-6">
                <StarRating rating={product.averageRating} readOnly size="sm" />
                <span className="text-sm font-bold text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors">
                    ({product.totalReviews || 0} reviews)
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="bg-slate-50 text-slate-600 border border-slate-200 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide">
                    {product.category}
                </span>
                {product.sustainabilityScore && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 tracking-wide shadow-sm">
                        🌱 Score: {product.sustainabilityScore}/10
                    </span>
                )}
            </div>

            <p className="text-4xl font-black text-slate-900 mb-8">₹{product.price}</p>

            <div className="prose max-w-none text-slate-600 mb-8 font-medium leading-relaxed">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                <p className="whitespace-pre-wrap text-lg">{product.description}</p>
            </div>

            {/* If you have stock info in your schema, show it here */}
            {product.stock !== undefined && (
                <p className={`text-sm font-bold mb-6 flex items-center gap-2 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {product.stock > 0 ? `${product.stock} in stock - Ready to ship` : 'Currently out of stock'}
                </p>
            )}
        </div>
    );
};

export default ProductInfo;
