import { useCartStore } from '../../cart/store/cartStore';

const AddToCart = ({ product }) => {
    // 1. Grab the addToCart function from our Zustand store
    const addToCart = useCartStore((state) => state.addToCart);

    // 2. Click handler
    const handleAdd = () => {
        addToCart(product);

        // Let's use a simple browser alert for feedback right now.
        // We can upgrade this to a nice Toast notification later!
        alert(`Added "${product.title}" to cart!`);
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
