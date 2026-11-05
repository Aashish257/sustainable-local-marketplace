import { useState, useEffect } from 'react';
import socket from '../../services/socket';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const AuctionBar = ({ product }) => {
    const { token, isAuthenticated } = useAuthStore();
    const productId = product?._id;
    const initialBid = product?.biddingStartingPrice || product?.price || 100;

    const [currentBid, setCurrentBid] = useState(initialBid);
    const [bidInput, setBidInput] = useState(initialBid + 50);
    const [isBouncing, setIsBouncing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState('02:45:10');

    // Socket Room Join & Bid Listeners
    useEffect(() => {
        if (!productId) return;

        socket.emit('join_product', productId);

        const handleNewBid = (data) => {
            if (data.productId === productId || data._id === productId) {
                const newAmount = Number(data.amount || data.price || 0);
                if (newAmount > 0) {
                    setCurrentBid(newAmount);
                    setBidInput(newAmount + 50);
                    setIsBouncing(true);
                    setTimeout(() => setIsBouncing(false), 300);
                    toast.success(`New high bid placed: ₹${newAmount.toLocaleString('en-IN')}`);
                }
            }
        };

        const handleBidError = (data) => {
            setSubmitting(false);
            toast.error(data.message || 'Bid was lower than current high bid.');
        };

        socket.on('new_bid', handleNewBid);
        socket.on('bid_error', handleBidError);

        // Simple Countdown simulation
        const timer = setInterval(() => {
            const now = new Date();
            const h = String(23 - now.getHours()).padStart(2, '0');
            const m = String(59 - now.getMinutes()).padStart(2, '0');
            const s = String(59 - now.getSeconds()).padStart(2, '0');
            setTimeLeft(`${h}:${m}:${s}`);
        }, 1000);

        return () => {
            socket.emit('leave_product', productId);
            socket.off('new_bid', handleNewBid);
            socket.off('bid_error', handleBidError);
            clearInterval(timer);
        };
    }, [productId]);

    const handleQuickIncrement = (amt) => {
        setBidInput(prev => prev + amt);
    };

    const handlePlaceBid = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please sign in to place auction bids.');
            return;
        }
        if (bidInput <= currentBid) {
            toast.error(`Bid must be higher than current bid (₹${currentBid})`);
            return;
        }

        setSubmitting(true);
        socket.emit('place_bid', {
            productId,
            amount: Number(bidInput),
            token
        });

        setTimeout(() => setSubmitting(false), 1200);
    };

    if (!product?.biddingEnabled) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-surface)]/95 dark:bg-[#041c15]/95 backdrop-blur-xl border-t border-[var(--border-card)] shadow-2xl transition-all duration-300">
            <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left: Live Status & Current High Bid */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                                    LIVE BIDDING
                                </span>
                                <span className="text-xs font-mono text-[var(--text-muted)] border border-amber-500/30 px-2 py-0.5 rounded-full">
                                    ⏳ {timeLeft}
                                </span>
                            </div>
                            <h3 className="text-xs text-[var(--text-muted)] font-sans hidden sm:block truncate max-w-xs">
                                {product.title}
                            </h3>
                        </div>

                        <div className="text-right sm:text-left border-l border-[var(--border-card)] pl-4 sm:pl-6">
                            <span className="text-xs text-[var(--text-muted)] font-mono uppercase block">CURRENT HIGH BID</span>
                            <span className={`text-xl sm:text-2xl font-black font-mono text-amber-500 inline-block transition-transform duration-200 ${isBouncing ? 'scale-125 text-emerald-400' : ''}`}>
                                ₹{currentBid.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Right: Quick buttons & Bid action */}
                    <form onSubmit={handlePlaceBid} className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="hidden md:flex items-center gap-1.5 font-mono text-xs">
                            <button
                                type="button"
                                onClick={() => handleQuickIncrement(50)}
                                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500 hover:text-amber-500 transition-colors"
                            >
                                +₹50
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickIncrement(100)}
                                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500 hover:text-amber-500 transition-colors"
                            >
                                +₹100
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickIncrement(250)}
                                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-muted)] hover:border-amber-500 hover:text-amber-500 transition-colors"
                            >
                                +₹250
                            </button>
                        </div>

                        <div className="relative flex-1 sm:w-36">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">₹</span>
                            <input
                                type="number"
                                min={currentBid + 1}
                                step="10"
                                value={bidInput}
                                onChange={(e) => setBidInput(Number(e.target.value))}
                                className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold bg-transparent border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-amber px-5 py-2.5 text-xs uppercase font-bold flex-shrink-0 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Place Bid'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AuctionBar;
