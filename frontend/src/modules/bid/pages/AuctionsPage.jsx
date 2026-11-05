import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock } from 'lucide-react';
import { useProducts } from '../../product/services/productQueries';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import EmptyState from '../../../shared/components/EmptyState';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// "2d 4h", "3h 12m", "45m", "Ending now"
const timeLeftLabel = (end, now) => {
    if (!end) return 'No end time';
    const ms = new Date(end).getTime() - now;
    if (ms <= 0) return 'Ending now';
    const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h left`;
    if (h > 0) return `${h}h ${m % 60}m left`;
    return `${Math.max(m, 1)}m left`;
};

const AuctionCard = ({ p, now, ended }) => {
    // Same floor as the backend: an unset (0) starting price falls back to the list price
    const price = p.currentBid ?? (p.biddingStartingPrice || p.price);
    const endingSoon = !ended && p.biddingEndTime && new Date(p.biddingEndTime).getTime() - now < 3_600_000;
    return (
        <Link to={`/products/${p._id}`} className="glass-card hover-card-trigger overflow-hidden flex flex-col">
            <div className="aspect-[4/3] bg-[var(--bg-surface-elevated)]">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
            </div>
            <div className="p-4 space-y-2 flex-1 flex flex-col">
                <p className="text-xs text-[var(--text-muted)]">{p.category}</p>
                <h3 className="font-display font-semibold text-[var(--text-main)] line-clamp-2">{p.title}</h3>
                <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                    <div>
                        <p className="text-xs text-[var(--text-muted)]">
                            {ended ? (p.auctionWinner ? 'Sold for' : 'No bids') : p.currentBid != null ? 'Current bid' : 'Starting at'}
                        </p>
                        <p className="text-lg font-bold font-mono text-[var(--text-main)]">{fmt(price)}</p>
                    </div>
                    {ended ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-muted)]">Ended</span>
                    ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            endingSoon ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        }`}>
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            {timeLeftLabel(p.biddingEndTime, now)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

// Dedicated auctions page: buyers no longer have to filter the marketplace to find bids
const AuctionsPage = () => {
    const live = useProducts({ type: 'auction', auction: 'live', sort: 'ending', limit: 24 });
    const ended = useProducts({ type: 'auction', auction: 'ended', sort: 'newest', limit: 8 });

    // Refresh "time left" labels every 30s without refetching
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(t);
    }, []);

    const liveItems = live.data?.data || [];
    const endedItems = ended.data?.data || [];

    return (
        <div className="container mx-auto px-4 py-10 space-y-12">
            <header className="space-y-2">
                <h1 className="font-display text-4xl font-bold text-[var(--text-main)] flex items-center gap-3">
                    <Gavel className="w-8 h-8 text-amber-500" aria-hidden="true" />
                    Live auctions
                </h1>
                <p className="text-[var(--text-muted)] max-w-2xl">
                    One-of-a-kind and upcycled pieces sold to the highest bidder. Bids update live, and the winner pays at the winning price when the auction ends.
                </p>
            </header>

            <section aria-labelledby="live-heading" className="space-y-4">
                <h2 id="live-heading" className="font-display text-xl font-semibold text-[var(--text-main)]">
                    Ending soonest {liveItems.length > 0 && <span className="text-[var(--text-muted)] font-normal">({liveItems.length})</span>}
                </h2>
                {live.isLoading ? (
                    <SkeletonGrid count={4} />
                ) : live.isError ? (
                    <p role="alert" className="text-rose-600">Couldn't load auctions. Please refresh the page.</p>
                ) : liveItems.length === 0 ? (
                    <EmptyState title="No live auctions right now" description="Check back soon, or browse the marketplace." actionLabel="Browse marketplace" actionLink="/marketplace" />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {liveItems.map((p) => <AuctionCard key={p._id} p={p} now={now} />)}
                    </div>
                )}
            </section>

            {endedItems.length > 0 && (
                <section aria-labelledby="ended-heading" className="space-y-4">
                    <h2 id="ended-heading" className="font-display text-xl font-semibold text-[var(--text-main)]">Recently ended</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-80">
                        {endedItems.map((p) => <AuctionCard key={p._id} p={p} now={now} ended />)}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AuctionsPage;
