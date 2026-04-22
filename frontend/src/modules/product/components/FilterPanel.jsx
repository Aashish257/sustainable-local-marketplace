const FilterPanel = ({ filters, setFilters }) => {

    // Helper function to update a single filter without wiping out the others
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to page 1 whenever a filter changes!
        }));
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-4">Filters</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                    className="w-full border rounded p-2"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="home">Home & Garden</option>
                </select>
            </div>
        </div>
    );
};

export default FilterPanel;
