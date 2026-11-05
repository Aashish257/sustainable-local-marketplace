import { useState, useEffect } from 'react';
import socket from '../../../services/socket';
import { getHighestBid } from '../services/bidService';
import useAuthStore from '../../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Clock } from 'lucide-react';
import apiClient from '../../../services/apiClient';

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
    const navigate = useNavigate();
    const [paying, setPaying] = useState(false);

    // Winner checkout: backend creates (or re-opens) one order at the winning price
    const handlePayNow = async () => {
        setPaying(true);
        try {
            const res = await apiClient.post(`/orders/auction/${productId}`);
            navigate(`/payment/${res.data.data._id}`);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Could not start checkout', type: 'error' });
            setPaying(false);
        }
    };

    // Auction end state: from the product on load, then live via 'auction_closed'
    const [auction, setAuction] = useState({
        closed: !!product?.auctionClosed,
        winnerId: product?.auctionWinner?._id || product?.auctionWinner || null,
        amount: product?.currentBid ?? null,
    });
    const endTime = product?.biddingEndTime ? new Date(product.biddingEndTime).getTime() : null;
    const [now, setNow] = useState(() => Date.now());

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

    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

    return (
        <section aria-labelledby="auction-title" className="glass-card p-6 space-y-5">
            {/* Header: title + connection status (text, not colour only) */}
            <div className="flex items-center justify-between gap-3">
                <h3 id="auction-title" className="font-display text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-amber-500" aria-hidden="true" />
                    Live auction
                </h3>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isConnected ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                    {isConnected ? 'Live updates on' : 'Reconnecting…'}
                </span>
            </div>

            {/* Current bid */}
            <div className="rounded-xl p-5 text-center bg-[var(--bg-surface-elevated)] border border-[var(--border-card)]">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                    {currentBid ? 'Current highest bid' : 'Starting price'}
                </p>
                {isLoading ? (
                    <p className="text-3xl font-bold text-[var(--text-subtle)] animate-pulse">Loading…</p>
                ) : (
                    <p className="text-4xl font-bold font-mono text-[var(--text-main)]" aria-live="polite">
                        {fmt(currentBid ? currentBid.amount : basePrice)}
                    </p>
                )}
                {currentBid && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">Starting price {fmt(basePrice)}</p>
                )}
                {/* Countdown: amber is reserved for urgency (spec 0.1) and always paired with text */}
                {endTime && !hasEnded && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        Ends in <span className="font-mono">{formatTimeLeft(timeLeft)}</span>
                    </p>
                )}
            </div>

            {/* Result once the auction has ended */}
            {hasEnded && (
                <div aria-live="polite" className="rounded-xl p-4 text-center border border-[var(--border-card)] space-y-2">
                    <p className="text-sm font-semibold text-[var(--text-main)]">Auction closed</p>
                    <p className="text-sm text-[var(--text-muted)]">
                        {!auction.closed
                            ? 'Finalising the result…'
                            : auction.winnerId && auction.winnerId === myId
                                ? `You won at ${fmt(auction.amount)}`
                                : auction.winnerId
                                    ? `Sold for ${fmt(auction.amount)}`
                                    : 'Ended with no bids'}
                    </p>
                    {auction.closed && auction.winnerId && auction.winnerId === myId && (
                        <button type="button" onClick={handlePayNow} disabled={paying} className="btn-primary w-full py-2.5 text-sm">
                            {paying ? 'Opening checkout…' : `Pay ${fmt(auction.amount)} now`}
                        </button>
                    )}
                </div>
            )}

            {/* Feedback from the last action */}
            {message && (
                <p role={message.type === 'error' ? 'alert' : 'status'} className={`px-4 py-2.5 rounded-lg text-sm text-center ${
                    message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                }`}>
                    {message.text}
                </p>
            )}

            {/* Bidding form */}
            {!hasEnded && (isAuthenticated ? (
                <form onSubmit={handlePlaceBid} className="space-y-3">
                    <div>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Quick add</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[50, 100, 250].map((inc) => (
                                <button
                                    key={inc}
                                    type="button"
                                    onClick={() => handleQuickAdd(inc)}
                                    className="btn-secondary py-2.5 text-sm font-mono"
                                    aria-label={`Set bid to ${fmt((minBid || 0) + inc)}`}
                                >
                                    +{fmt(inc)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="bid-amount" className="block text-xs font-medium text-[var(--text-muted)]">
                        Your bid (more than {fmt(minBid)})
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] text-sm" aria-hidden="true">₹</span>
                            <input
                                id="bid-amount"
                                type="number"
                                inputMode="numeric"
                                value={bidInput}
                                onChange={(e) => setBidInput(e.target.value)}
                                placeholder={(minBid + 1).toLocaleString('en-IN')}
                                min={minBid + 1}
                                className="w-full pl-7 pr-3 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-sm font-mono text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <button type="submit" disabled={!isValidBid} className="btn-primary px-5 py-2.5 text-sm">
                            Place bid
                        </button>
                    </div>
                </form>
            ) : (
                <Link to="/login" className="btn-primary block text-center py-2.5 text-sm">
                    Sign in to place a bid
                </Link>
            ))}
        </section>
    );
};

export default BidPanel;

