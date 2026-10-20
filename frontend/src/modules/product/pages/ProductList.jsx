import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../services/productQueries';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';

const SORT_OPTIONS = [
    { value: '', label: 'Sort: Most Relevant' },
    { value: 'newest', label: 'Sort: Newest Arrivals' },
    { value: 'eco', label: 'Sort: Highest Eco Score' },
    { value: 'rating', label: 'Sort: Top Rated' },
    { value: 'price_asc', label: 'Sort: Price Low to High' },
    { value: 'price_desc', label: 'Sort: Price High to Low' },
];

const CATEGORY_PILLS = [
    'All',
    'Zero Waste',
    'Organic Food',
    'Sustainable Fashion',
    'Eco Home',
    'Clean Beauty',
    'Solar & Tech',
];

const ProductList = () => {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || '';
    const initialSearch = searchParams.get('search') || '';

    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        search: initialSearch,
        category: initialCategory,
        minPrice: '',
        maxPrice: '',
        minEcoScore: '',
        sort: '',
    });

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useProducts(filters);

    const products = data?.data || [];
    const pagination = data?.pagination || { total: products.length, totalPages: 1, page: filters.page, limit: 12 };

    const handleCategoryPillClick = (cat) => {
        setFilters(prev => ({
            ...prev,
            category: cat === 'All' ? '' : cat,
            page: 1
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            page: 1,
            limit: 12,
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            minEcoScore: '',
            sort: '',
        });
    };

    const activeFiltersCount = [filters.category, filters.minPrice, filters.maxPrice, filters.minEcoScore, filters.search].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-card)] pb-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase font-bold mb-2">
                            <span>VERIFIED PRODUCER NETWORK</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[var(--text-main)]">
                            Marketplace Catalog
                        </h1>
                        <p className="text-xs text-[var(--text-muted)] font-sans mt-1 max-w-xl">
                            Direct local goods crafted by organic farmers and zero-waste artisans. Filter by verified sustainability metrics.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-[var(--text-muted)]">
                            SHOWING: <strong className="text-[var(--text-main)]">{products.length}</strong> OF <strong className="text-emerald-600 dark:text-emerald-400">{pagination.total || products.length}</strong> PRODUCTS
                        </span>
                    </div>
                </div>

                {/* Top Controls: Search, Sort, Mobile Filter Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-full sm:flex-1">
                        <SearchBar filters={filters} setFilters={setFilters} />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Mobile Filter Drawer Button */}
                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] text-xs font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                        </button>

                        {/* Sort Dropdown */}
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
                            className="bg-[var(--bg-surface)] border border-[var(--border-card)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Fast Category Pill Strip */}
                <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORY_PILLS.map((cat) => {
                        const isSelected = cat === 'All' ? !filters.category : filters.category === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryPillClick(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                                        : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Layout: Sidebar + Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Desktop Persistent Filter Sidebar */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-24">
                        <FilterPanel filters={filters} setFilters={setFilters} />
                    </div>

                    {/* Product Grid Area */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="glass-card h-80 animate-pulse" />
                                ))}
                            </div>
                        ) : isError ? (
                            <ErrorState
                                title="Marketplace catalog unavailable"
                                description="We were unable to load the sustainable catalog. Please verify your connection and retry."
                                onRetry={refetch}
                            />
                        ) : products.length === 0 ? (
                            <EmptyState
                                title="No matching products found"
                                description="Try loosening your filters or search query to find more sustainable goods."
                                actionLabel="Clear All Filters"
                                onAction={clearAllFilters}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-8 border-t border-[var(--border-card)]">
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={filters.page <= 1}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--border-card)] text-xs disabled:opacity-30 cursor-pointer"
                                >
                                    ← Previous
                                </button>
                                <span className="text-xs font-mono text-[var(--text-muted)]">
                                    Page {filters.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={filters.page >= pagination.totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--border-card)] text-xs disabled:opacity-30 cursor-pointer"
                                >
                                    Next →
                                </button>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="relative w-full max-w-xs h-full bg-[var(--bg-surface)] p-5 overflow-y-auto shadow-2xl z-10 space-y-4">
                        <div className="flex justify-between items-center border-b border-[var(--border-card)] pb-3">
                            <h3 className="font-bold text-sm">Filter Catalog</h3>
                            <button onClick={() => setMobileFiltersOpen(false)} className="text-sm font-bold">✕</button>
                        </div>
                        <FilterPanel filters={filters} setFilters={setFilters} />
                        <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="btn-primary w-full py-2.5 text-xs font-bold"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
