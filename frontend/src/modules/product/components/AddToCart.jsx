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
            <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-lg cursor-not-allowed">
                Out of Stock
            </button>
        );
    }

    return (
        <button
            onClick={handleAdd}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md transition-colors transform hover:scale-[1.01] active:scale-[0.99]"
        >
            Add to Cart
        </button>
    );
};

export default AddToCart;
