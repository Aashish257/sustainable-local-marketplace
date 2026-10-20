import { useState, useEffect } from 'react';
import socket from '../../../services/socket';
import { getHighestBid } from '../services/bidService';
import useAuthStore from '../../../store/authStore';
import { Link } from 'react-router-dom';

// 93784000 ms -> "1d 02:03:04"
const formatTimeLeft = (ms) => {
    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / 86400);
    const pad = (n) => String(n).padStart(2, '0');
    const hms = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
    return d > 0 ? `${d}d ${hms}` : hms;
};

const BidPanel = ({ product }) => {
    const [currentBid, setCurrentBid] = useState(null);
    const [bidInput, setBidInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const { isAuthenticated, user } = useAuthStore();
    const myId = user?._id || user?.id;

    // Auction end state: from the product on load, then live via 'auction_closed'
    const [auction, setAuction] = useState({
        closed: !!product?.auctionClosed,
        winnerId: product?.auctionWinner?._id || product?.auctionWinner || null,
        amount: product?.currentBid ?? null,
    });
    const endTime = product?.biddingEndTime ? new Date(product.biddingEndTime).getTime() : null;
    const [now, setNow] = useState(Date.now());

    // Countdown tick (stops once the auction is closed)
    useEffect(() => {
        if (!endTime || auction.closed) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [endTime, auction.closed]);

    const timeLeft = endTime ? Math.max(0, endTime - now) : null;
    const hasEnded = auction.closed || timeLeft === 0;

    const productId = product?._id;
    const basePrice = product?.biddingStartingPrice || product?.price || 0;
    const minBid = currentBid ? currentBid.amount : basePrice;

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

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
            setMessage({ text: `Top bid updated: ₹${data.amount.toLocaleString()}`, type: 'success' });
            setTimeout(() => setMessage(null), 4000);
        };

        const handleBidError = ({ message: errMsg }) => {
            setMessage({ text: errMsg, type: 'error' });
            setTimeout(() => setMessage(null), 4000);
        };

        const handleAuctionClosed = (data) => {
            if (data.productId !== productId) return;
            setAuction({ closed: true, winnerId: data.winnerId, amount: data.amount });
        };

        socket.on('new_bid', handleNewBid);
        socket.on('bid_error', handleBidError);
        socket.on('auction_closed', handleAuctionClosed);

        return () => {
            socket.emit('leave_product', productId);
            socket.off('new_bid', handleNewBid);
            socket.off('bid_error', handleBidError);
            socket.off('auction_closed', handleAuctionClosed);
        };
    }, [productId]);

    // 3. Place bid
    const handlePlaceBid = (e) => {
        if (e) e.preventDefault();
        const amount = parseFloat(bidInput);
        if (!amount || amount <= minBid) return;
        socket.emit('place_bid', { productId, amount });
        setBidInput('');
    };

    const handleQuickAdd = (increment) => {
        const newAmount = (minBid || 0) + increment;
        setBidInput(newAmount.toString());
    };

    const isValidBid = parseFloat(bidInput) > minBid;

    return (
        <div className="bg-[#0d0d16] rounded-2xl border border-[#27272A] p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                    LIVE AUCTION ENGINE
                </h3>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                    isConnected ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-amber-950/40 text-amber-400 border-amber-800'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    {isConnected ? 'SOCKET // CONNECTED' : 'SOCKET // RECONNECTING'}
                </span>
            </div>

            {/* Current Bid Display */}
            <div className="bg-[#020206] rounded-xl p-5 text-center border border-[#27272A]">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">HIGHEST ACTIVE BID</p>
                {isLoading ? (
                    <p className="text-2xl font-mono font-bold text-[#F59E0B] animate-pulse">SYNCING FEED...</p>
                ) : (
                    <>
                        <p className="text-4xl font-mono font-black text-[#F59E0B] tracking-tight">
                            ₹{currentBid ? currentBid.amount.toLocaleString() : basePrice.toLocaleString()}
                        </p>
                        <p className="text-xs font-mono text-zinc-500 mt-1">
                            {currentBid ? `Base floor price: ₹${basePrice.toLocaleString()}` : 'No bids placed yet — open bidding below'}
                        </p>
                    </>
                )}
            </div>

            {/* Countdown */}
            {endTime && !hasEnded && (
                <p className="text-center text-xs font-mono text-zinc-400">
                    ENDS IN <span className="text-[#F59E0B] font-bold">{formatTimeLeft(timeLeft)}</span>
                </p>
            )}

            {/* Auction ended banner (aria-live so screen readers announce the result) */}
            {hasEnded && (
                <div aria-live="polite" className="rounded-xl p-4 text-center border border-[#27272A] bg-[#020206] space-y-1">
                    <p className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Auction closed</p>
                    <p className="text-sm font-mono text-[#F59E0B]">
                        {!auction.closed
                            ? 'Finalising result…'
                            : auction.winnerId && auction.winnerId === myId
                                ? `🏆 You won at ₹${auction.amount?.toLocaleString()}`
                                : auction.winnerId
                                    ? `Sold for ₹${auction.amount?.toLocaleString()}`
                                    : 'Ended with no bids'}
                    </p>
                </div>
            )}

            {/* Feedback Message */}
            {message && (
                <div className={`px-4 py-2.5 rounded-lg text-xs font-mono text-center animate-fade-in ${
                    message.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800' : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Quick increment buttons */}
            {isAuthenticated && !hasEnded && (
                <div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">QUICK STEP INCREMENT:</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[50, 100, 250].map((inc) => (
                            <button
                                key={inc}
                                type="button"
                                onClick={() => handleQuickAdd(inc)}
                                className="py-2 px-3 rounded-lg bg-[#181826] hover:bg-[#F59E0B]/10 hover:text-[#FBBF24] hover:border-[#F59E0B] text-zinc-300 border border-[#27272A] font-mono font-bold text-xs transition-all cursor-pointer"
                            >
                                +₹{inc}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bid Input */}
            {hasEnded ? null : isAuthenticated ? (
                <form onSubmit={handlePlaceBid} className="space-y-2">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold text-xs">₹</span>
                            <input
                                type="number"
                                value={bidInput}
                                onChange={e => setBidInput(e.target.value)}
                                placeholder={`Min: ₹${(minBid + 1).toLocaleString()}`}
                                min={minBid + 1}
                                className="w-full pl-7 pr-3 py-2.5 bg-[#020206] border border-[#27272A] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isValidBid}
                            className="btn-primary px-5 py-2.5 text-xs font-mono font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            SUBMIT BID
                        </button>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 text-center">
                        Minimum bid must exceed ₹{minBid.toLocaleString()}
                    </p>
                </form>
            ) : (
                <div className="text-center py-2">
                    <Link to="/login" className="font-mono text-xs text-[#F59E0B] hover:underline">
                        AUTHENTICATE TO PARTICIPATE IN AUCTION →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default BidPanel;

