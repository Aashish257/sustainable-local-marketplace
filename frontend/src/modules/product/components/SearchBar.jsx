import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const SearchBar = ({ filters, setFilters }) => {
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [debouncedSearch] = useDebounce(localSearch, 300);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            search: debouncedSearch,
            page: 1
        }));
    }, [debouncedSearch, setFilters]);

    return (
        <div className="relative">
            {/* Search icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <input
                id="product-search"
                type="text"
                placeholder="Search products by title, artisan origin, materials..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-all font-sans"
            />

            {/* Clear button */}
            {localSearch && (
                <button
                    type="button"
                    onClick={() => setLocalSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all text-[var(--text-muted)] cursor-pointer"
                    aria-label="Clear search query"
                >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
