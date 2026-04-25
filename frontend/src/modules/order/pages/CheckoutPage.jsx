import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { useCreateOrder } from '../services/orderQueries';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal } = useCartStore();
    const [isSyncing, setIsSyncing] = useState(false);

    // Grab our React Query mutation
    const { mutate: createOrder, isPending, isError, error } = useCreateOrder();

    const handleCreateOrder = async () => {
        if (cart.length === 0 || isSyncing) return;
        setIsSyncing(true);

        try {
            const storage = localStorage.getItem("auth-storage");
            let token = null;
            if (storage) {
                try {
                    token = JSON.parse(storage).state?.token;
                } catch(e){}
            }
            
            const headers = { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            // 1. Fetch current backend cart
            const cartRes = await fetch('http://localhost:5000/api/cart', { headers });
            if (cartRes.ok) {
                const backendCart = await cartRes.json();
                // 2. Clear backend cart so we don't duplicate quantities
                for (const item of backendCart.data?.items || []) {
                    // backend populates productId, so we need item.productId._id
                    const idToRemove = item.productId?._id || item.productId;
                    await fetch(`http://localhost:5000/api/cart/${idToRemove}`, {
                        method: 'DELETE',
                        headers
                    });
                }
            }

            // 3. Sync Zustand cart to backend
            for (const item of cart) {
                await fetch('http://localhost:5000/api/cart', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        productId: item._id,
                        quantity: item.quantity
                    })
                });
            }

            // Now that the backend cart is populated, we can create the order securely!
            createOrder({}, {
                onSuccess: (data) => {
                    setIsSyncing(false);
                    alert("Order Created! Proceeding to Payment...");
                    navigate(`/payment/${data.data._id}`);
                },
                onError: (err) => {
                    setIsSyncing(false);
                    console.error("Order creation failed", err);
                }
            });
        } catch (error) {
            setIsSyncing(false);
            console.error("Cart sync failed", error);
            alert("Failed to sync cart with server.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                    {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{item.quantity}x</span>
                                <span>{item.title}</span>
                            </div>
                            <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between text-2xl font-bold mt-6">
                    <span>Total</span>
                    <span className="text-green-600">${getCartTotal().toFixed(2)}</span>
                </div>
            </div>

            {isError && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-6 text-center">
                    Failed to create order: {error.response?.data?.message || error.message}
                </div>
            )}

            <button
                onClick={handleCreateOrder}
                disabled={cart.length === 0 || isPending || isSyncing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending || isSyncing ? "Creating Order..." : "Confirm & Create Order"}
            </button>
        </div>
    );
};

export default CheckoutPage;
