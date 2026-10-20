import StarRating from '../../review/components/StarRating';

const ProductInfo = ({ product }) => {
    const sellerName = product.sellerId?.name || 'Verified Artisan';

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded border border-[#F59E0B]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    SOLD BY {sellerName}
                </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2.5 text-white tracking-tight leading-tight">
                {product.title}
            </h1>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-2.5 mb-5 font-mono text-xs">
                <StarRating rating={product.averageRating || 0} readOnly size="sm" />
                <span className="text-zinc-500">
                    ({product.totalReviews || 0} VERIFIED AUDITS)
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-5 font-mono text-xs">
                <span className="bg-[#181826] text-zinc-300 border border-[#27272A] px-3 py-1 rounded uppercase">
                    {product.category || 'General'}
                </span>
                {product.sustainabilityScore !== undefined && (
                    <span className="bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/30 px-3 py-1 rounded flex items-center gap-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        ECO SCORE: {product.sustainabilityScore}/10
                    </span>
                )}
            </div>

            <div className="flex items-baseline gap-3 mb-5">
                <p className="text-3xl font-mono font-bold text-white">₹{product.price?.toLocaleString()}</p>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800 uppercase">
                    NET ZERO SETTLEMENT
                </span>
            </div>

            <div className="mb-5">
                <h3 className="mono-label text-zinc-500 mb-1.5">SPECIFICATION &amp; ORIGIN</h3>
                <p className="whitespace-pre-wrap text-xs text-zinc-400 font-sans leading-relaxed">{product.description}</p>
            </div>

            {product.stock !== undefined && (
                <div className={`text-xs font-mono font-bold mb-4 flex items-center gap-2 ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {product.stock > 0 ? `${product.stock} ALLOCATED UNITS AVAILABLE` : 'DEPLETED'}
                </div>
            )}
        </div>
    );
};

export default ProductInfo;

