const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'Zero Waste', label: 'Zero Waste' },
    { value: 'Organic Food', label: 'Organic Food' },
    { value: 'Sustainable Fashion', label: 'Sustainable Fashion' },
    { value: 'Eco Home', label: 'Eco Home' },
    { value: 'Clean Beauty', label: 'Clean Beauty' },
    { value: 'Solar & Tech', label: 'Solar & Tech' },
    { value: 'Upcycled Art', label: 'Upcycled Art' },
    { value: 'Garden & Soil', label: 'Garden & Soil' },
];

const FilterPanel = ({ filters, setFilters }) => {

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };

    const activeFiltersCount = [
        filters.category,
        filters.minPrice,
        filters.maxPrice,
        filters.minEcoScore
    ].filter(Boolean).length;

    const clearAll = () => {
        setFilters(prev => ({
            ...prev,
            category: '',
            minPrice: '',
            maxPrice: '',
            minEcoScore: '',
            page: 1
        }));
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                        Filters
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className="w-4 h-4 bg-emerald-600 text-white text-xs font-mono font-bold rounded-full flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-sans text-rose-500 hover:text-rose-400 font-semibold cursor-pointer"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="p-5 space-y-6">
                {/* 1. Categories */}
                <div className="space-y-3">
                    <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                        Category
                    </label>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => handleFilterChange('category', cat.value)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                    filters.category === cat.value
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                <span>{cat.label}</span>
                                {filters.category === cat.value && <span>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Price Range (Min & Max) */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-card)]">
                    <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                        Price Range (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <input
                                type="number"
                                placeholder="Min ₹"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Max ₹"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Minimum Sustainability Score */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-card)]">
                    <div className="flex justify-between items-center text-xs">
                        <label className="font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                            Min Sustainability
                        </label>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {filters.minEcoScore ? `${filters.minEcoScore}/10` : 'Any'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={filters.minEcoScore || 0}
                        onChange={(e) => handleFilterChange('minEcoScore', e.target.value > 0 ? e.target.value : '')}
                        className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-mono text-[var(--text-muted)]">
                        <span>0 (Any)</span>
                        <span>5 (Fair)</span>
                        <span>8+ (High)</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FilterPanel;
