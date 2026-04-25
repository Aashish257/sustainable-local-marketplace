import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const CartPage = () => {
    const navigate = useNavigate();
    // Grab everything we need from Zustand
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCartStore();

    // Edge Case: Empty Cart
    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/products" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT: Cart Items List */}
                <div className="w-full lg:w-2/3 space-y-6">
                    {cart.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-lg shadow-sm border gap-6">
                            {/* Product Image */}
                            <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</span>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-grow">
                                <Link to={`/products/${item._id}`} className="text-lg font-semibold hover:text-green-600 transition-colors">
                                    {item.title}
                                </Link>
                                <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item._id, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                                >
                                    -
                                </button>
                                <span className="font-semibold w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item._id, 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold"
                                >
                                    +
                                </button>
                            </div>

                            {/* Total per item & Remove */}
                            <div className="flex flex-col items-end gap-2 min-w-[80px]">
                                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Order Summary (Sticky) */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-gray-50 p-6 rounded-lg border sticky top-24">
                        <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>

                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-sm text-gray-500">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div className="flex justify-between border-t pt-4 mb-6">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-xl font-bold text-green-600">${getCartTotal().toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md transition-colors"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
