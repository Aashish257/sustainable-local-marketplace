import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreatePayment, useVerifyPayment } from '../services/paymentQueries';
import { useCartStore } from '../../cart/store/cartStore';
import toast from 'react-hot-toast';

const StepIndicator = ({ step }) => {
    const steps = ['01 Delivery Details', '02 Payment Authorization', '03 Confirmation'];
    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 text-xs font-sans">
            {steps.map((label, i) => {
                const idx = i + 1;
                const active = step === idx;
                const done = step > idx;
                return (
                    <div key={label} className="flex items-center gap-2 sm:gap-3">
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            active
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md shadow-emerald-600/20'
                                : done
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] border-[var(--border-card)]'
                        }`}>
                            {done ? `✓ ${label}` : label}
                        </div>
                        {i < steps.length - 1 && (
                            <span className="text-[var(--text-muted)] opacity-40 font-bold">→</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const clearCart = useCartStore((state) => state.clearCart);
    const { mutate: createPayment, isPending: isCreating } = useCreatePayment();
    const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
    const [isSimulating, setIsSimulating] = useState(false);

    // Dynamically load Razorpay SDK
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleSimulatorPayment = () => {
        setIsSimulating(true);
        createPayment(orderId, {
            onSuccess: (res) => {
                const orderData = res.data;
                setTimeout(() => {
                    verifyPayment({
                        razorpay_order_id: orderData.id,
                        razorpay_payment_id: `pay_mock_${Date.now()}`,
                        razorpay_signature: `sig_mock_${orderData.id}`
                    }, {
                        onSuccess: () => {
                            clearCart();
                            setIsSimulating(false);
                            toast.success("Payment verified! Order confirmed.");
                            navigate(`/payment/success?orderId=${orderId}`);
                        },
                        onError: (err) => {
                            setIsSimulating(false);
                            navigate(`/payment/failure?reason=${encodeURIComponent(err?.response?.data?.error || "Signature verification failed")}`);
                        }
                    });
                }, 1000);
            },
            onError: (err) => {
                setIsSimulating(false);
                navigate(`/payment/failure?reason=${encodeURIComponent(err?.response?.data?.error || "Failed to initialize payment gateway")}`);
            }
        });
    };

    const handleRazorpayPayment = () => {
        createPayment(orderId, {
            onSuccess: (res) => {
                if (typeof window.Razorpay === 'undefined') {
                    toast('Using instant sandbox test checkout...', { icon: 'i' });
                    handleSimulatorPayment();
                    return;
                }

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || res.data.key || "rzp_test_dummy",
                    amount: res.data.amount,
                    currency: res.data.currency || "INR",
                    name: "SustainMarket",
                    description: `Payment for order #${orderId.slice(-6)}`,
                    order_id: res.data.id,
                    handler: (response) => {
                        verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            onSuccess: () => {
                                clearCart();
                                toast.success("Payment verified! Order confirmed.");
                                navigate(`/payment/success?orderId=${orderId}`);
                            },
                            onError: (err) => {
                                navigate(`/payment/failure?reason=${encodeURIComponent(err?.response?.data?.error || "Payment verification failed")}`);
                            }
                        });
                    },
                    theme: {
                        color: "#059669"
                    },
                    modal: {
                        ondismiss: () => {
                            toast('Payment canceled. Your cart is preserved.', { icon: 'ℹ️' });
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            },
            onError: (err) => {
                toast.error(err?.response?.data?.error || "Failed to initialize payment.");
            }
        });
    };

    const isBusy = isCreating || isVerifying || isSimulating;

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-xl mx-auto space-y-8">
                
                <StepIndicator step={2} />

                <div className="text-center space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Complete payment
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                        ORDER ID: #{orderId}
                    </p>
                </div>

                <div className="glass-card p-6 space-y-6">
                    {/* Shield Icon */}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="text-[var(--text-main)] font-sans leading-relaxed">
                            Payments are processed by <strong>Razorpay</strong>. Your card details never touch our servers.
                        </p>
                    </div>

                    {/* Payment Gateways accepted */}
                    <div className="space-y-2 text-xs font-sans">
                        <span className="text-[var(--text-muted)] font-semibold block">Accepted Payment Methods:</span>
                        <div className="flex flex-wrap gap-2 font-mono text-xs">
                            <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">UPI (GPay/PhonePe)</span>
                            <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">Debit &amp; Credit Cards</span>
                            <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">Net Banking</span>
                        </div>
                    </div>

                    {/* Primary Button */}
                    <button
                        onClick={handleRazorpayPayment}
                        disabled={isBusy}
                        className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                        {isBusy ? 'Processing Authorization...' : 'Pay with Razorpay Gateway →'}
                    </button>

                    {/* Sandbox Simulator shortcut */}
                    <div className="pt-2 text-center">
                        <button
                            onClick={handleSimulatorPayment}
                            disabled={isBusy}
                            className="text-xs text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 font-mono underline cursor-pointer"
                        >
                            Test payment (sandbox mode)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentPage;
