import { useCartStore } from '../../cart/store/cartStore';
import toast from 'react-hot-toast';

const AddToCart = ({ product }) => {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAdd = () => {
        addToCart(product);
        toast.success(`🛒 "${product.title}" added to cart!`);
    };

    // 3. Safety check: Don't show the button if out of stock
    if (product.stock === 0) {
        return (
            <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed border border-slate-200">
                Out of Stock
            </button>
        );
    }

    return (
        <button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 tracking-wide text-lg"
        >
            Add to Cart
        </button>
    );
};

export default AddToCart;
