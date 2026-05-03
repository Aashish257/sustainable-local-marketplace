import { useState, useEffect } from 'react';
import socket from '../../../services/socket';
import { getHighestBid } from '../services/bidService';
import useAuthStore from '../../../store/authStore';

const BidPanel = ({ product }) => {
    const [currentBid, setCurrentBid] = useState(null);
    const [bidInput, setBidInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState(null); // { text, type: 'success' | 'error' }
    const { isAuthenticated } = useAuthStore();

    const productId = product?._id;
    const basePrice = product?.price || 0;
    const minBid = currentBid ? currentBid.amount : basePrice;

    // 1. Fetch current highest bid on mount via REST
    useEffect(() => {
        if (!productId) return;
        getHighestBid(productId)
            .then(res => setCurrentBid(res.data))
            .catch(() => setCurrentBid(null))
            .finally(() => setIsLoading(false));
    }, [productId]);

    // 2. Join product room and listen for new bids — CLEANUP ON UNMOUNT
    useEffect(() => {
        if (!productId) return;

        socket.emit('join_product', productId);

        const handleNewBid = (data) => {
            setCurrentBid(data);
            setMessage({ text: `🔥 New bid: ₹${data.amount}!`, type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        };

        const handleBidError = ({ message: errMsg }) => {
            setMessage({ text: errMsg, type: 'error' });
            setTimeout(() => setMessage(null), 4000);
        };

        socket.on('new_bid', handleNewBid);
        socket.on('bid_error', handleBidError);

        // CLEANUP: Leave room and remove listeners on unmount
        return () => {
            socket.emit('leave_product', productId);
            socket.off('new_bid', handleNewBid);
            socket.off('bid_error', handleBidError);
        };
    }, [productId]);

    // 3. Place bid
    const handlePlaceBid = () => {
        const amount = parseFloat(bidInput);
        if (!amount || amount <= minBid) return;
        socket.emit('place_bid', { productId, amount });
        setBidInput('');
    };

    const isValidBid = parseFloat(bidInput) > minBid;

    return (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    🔨 Live Auction
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${socket.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {socket.connected ? '● LIVE' : '● Offline'}
                </span>
            </div>

            {/* Current Bid Display */}
            <div className="bg-amber-50 rounded-xl p-5 mb-5 text-center border border-amber-100">
                <p className="text-sm text-amber-600 font-medium mb-1">Current Highest Bid</p>
                {isLoading ? (
                    <p className="text-2xl font-bold text-amber-800 animate-pulse">Loading...</p>
                ) : (
                    <>
                        <p className="text-4xl font-bold text-amber-700">
                            ₹{currentBid ? currentBid.amount.toLocaleString() : basePrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-amber-500 mt-1">
                            {currentBid ? `Starting price: ₹${basePrice}` : 'No bids yet — be the first!'}
                        </p>
                    </>
                )}
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium text-center transition-all
                    ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Bid Input */}
            {isAuthenticated ? (
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input
                            type="number"
                            value={bidInput}
                            onChange={e => setBidInput(e.target.value)}
                            placeholder={`Min: ₹${(minBid + 1).toLocaleString()}`}
                            min={minBid + 1}
                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                        />
                    </div>
                    <button
                        onClick={handlePlaceBid}
                        disabled={!isValidBid || !socket.connected}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        Place Bid
                    </button>
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm py-3">
                    <a href="/login" className="text-amber-600 font-bold hover:underline">Login</a> to place a bid
                </p>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
                Your bid must be higher than ₹{minBid.toLocaleString()}
            </p>
        </div>
    );
};

export default BidPanel;
