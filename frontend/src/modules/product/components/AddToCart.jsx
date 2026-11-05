import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import toast from 'react-hot-toast';

const AddToCart = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const addToCart = useCartStore((state) => state.addToCart);
    const navigate = useNavigate();

    const maxStock = product.stock || 1;

    const handleAdd = () => {
        addToCart(product, quantity);
        toast.success(`Allocated ${quantity} × "${product.title}" to cart`);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/checkout');
    };

    if (product.stock === 0) {
        return (
            <button disabled className="w-full bg-black/5 dark:bg-white/5 text-[var(--text-muted)] font-mono font-bold py-3.5 px-6 rounded-2xl cursor-not-allowed border border-[var(--border-card)] text-xs uppercase tracking-wider">
                INVENTORY DEPLETED
            </button>
        );
    }

    return (
        <div className="space-y-3.5">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-card)]">
                <span className="text-xs font-mono font-semibold text-[var(--text-muted)] pl-2 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] font-mono font-bold text-sm flex items-center justify-center border border-[var(--border-card)] hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>
                    <span className="text-sm font-mono font-bold text-[var(--text-main)] w-7 text-center">{quantity}</span>
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                        disabled={quantity >= maxStock}
                        className="w-8 h-8 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] font-mono font-bold text-sm flex items-center justify-center border border-[var(--border-card)] hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleAdd}
                    className="btn-secondary flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Add to Cart</span>
                </button>
                <button
                    onClick={handleBuyNow}
                    className="btn-primary flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                    <span>Buy now →</span>
                </button>
            </div>
        </div>
    );
};

export default AddToCart;

