import { useState } from 'react';
import { useProducts } from '../services/productQueries';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';

const ProductList = () => {
    // 1. Store our filters in state. If this state changes, React Query auto-refetches!
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        category: '',
    });

    // 2. Fetch the data
    const { data, isLoading, isError, error } = useProducts(filters);

    const handleNextPage = () => {
        setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    };

    const handlePrevPage = () => {
        setFilters.apply((prev) => ({
            ...prev, page: Math.max(1, prev.page - 1)
        }));
    };

    if (isError) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Sustainable Products</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar area for filters */}
                <aside className="w-full lg:w-1/4">
                    <SearchBar filters={filters} setFilters={setFilters} />
                    <FilterPanel filters={filters} setFilters={setFilters} />
                </aside>

                {/* Main content area for grid */}
                {/* Main content area for grid */}
                <main className="w-full lg:w-3/4">
                    {/* The Grid */}
                    <ProductGrid products={data?.data?.products} isLoading={isLoading} />

                    {/* Pagination Controls */}
                    {data?.data?.pagination && (
                        <div className="flex justify-center items-center mt-8 gap-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={filters.page === 1}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                            >
                                Previous
                            </button>

                            <span className="text-gray-700">
                                Page {data.data.pagination.page} of {data.data.pagination.totalPages || 1}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={filters.page >= (data.data.pagination.totalPages || 1)}
                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};

export default ProductList;
