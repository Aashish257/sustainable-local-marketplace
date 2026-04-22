import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const SearchBar = ({ filters, setFilters }) => {
    // We need a local state just for what the user is currently typing
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    // This hook waits 300ms after the user stops typing before updating debouncedSearch
    const [debouncedSearch] = useDebounce(localSearch, 300);

    // Whenever debouncedSearch finally updates, we push it UP to our global filters state
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            search: debouncedSearch,
            page: 1 // Always reset to page 1 when searching!
        }));
    }, [debouncedSearch, setFilters]);

    return (
        <div className="mb-6">
            <h3 className="font-semibold mb-2">Search</h3>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full border rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
                {/* A simple magnifying glass icon */}
                <span className="absolute left-3 top-3.5 text-gray-400">
                    🔍
                </span>
            </div>
        </div>
    );
};

export default SearchBar;
