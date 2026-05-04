import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreatePayment, useVerifyPayment } from '../services/paymentQueries';
import { useCartStore } from '../../cart/store/cartStore';
import toast from 'react-hot-toast';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const clearCart = useCartStore((state) => state.clearCart);

    const { mutate: createPayment, isPending: isCreating } = useCreatePayment();
    const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();

    // Dynamically load Razorpay Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handlePayment = () => {
        createPayment(orderId, {
            onSuccess: (res) => {
                const options = {
                    key: res.data.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy", // Razorpay requires a key!
                    amount: res.data.amount,
                    currency: res.data.currency,
                    name: "Sustainable Marketplace",
                    description: "Order Payment",
                    order_id: res.data.id, // Razorpay Order ID
                    handler: function (response) {
                        // Payment Success Callback
                        verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            onSuccess: () => {
                                clearCart(); // Task 6 Rule
                                navigate('/success'); // Task 6 Rule
                            },
                            onError: () => toast.error("Payment verification failed. Please contact support.")
                        });
                    },
                    theme: { color: "#16a34a" } // Tailwind green-600
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error("Payment failed. Please try again.");
                });
                rzp.open();
            },
            onError: () => toast.error("Failed to initialize payment. Please try again.")
        });
    };

    return (
        <div className="container mx-auto px-4 py-16 text-center max-w-lg">
            <h1 className="text-3xl font-bold mb-4">Complete Your Payment</h1>
            <p className="text-gray-600 mb-8">Order ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{orderId}</span></p>

            <button
                onClick={handlePayment}
                disabled={isCreating || isVerifying}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
                {isCreating || isVerifying ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
};

export default PaymentPage;
