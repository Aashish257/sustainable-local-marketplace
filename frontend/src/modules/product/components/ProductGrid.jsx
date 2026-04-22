import ProductCard from './ProductCard';

const ProductGrid = ({ products, isLoading }) => {
    if (isLoading) return <div className="text-center py-10">Loading products...</div>;

    // Safety check in case products array is empty or undefined
    if (!products || products.length === 0) {
        return <div className="text-center py-10 text-gray-500">No products found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
