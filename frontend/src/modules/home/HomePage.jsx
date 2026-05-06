import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { PRODUCTS } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';

const HomePage = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['featured-products'],
        // Fetch 6-8 products for the homepage
        queryFn: () => apiClient.get(PRODUCTS, { params: { limit: 8 } }).then(r => r.data),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const products = data?.data || [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 🌟 HERO SECTION */}
            <section className="bg-green-700 text-white py-20 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Shop Sustainably, <span className="text-green-300">Shop Local.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl mx-auto">
                        Discover eco-friendly products crafted by local artisans. Reduce your carbon footprint, one purchase at a time.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => navigate('/products')}
                            className="bg-white text-green-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg"
                        >
                            Browse Products
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-green-800 text-white border border-green-600 font-bold text-lg px-8 py-4 rounded-xl hover:bg-green-900 transition-transform hover:scale-105 shadow-lg"
                        >
                            Start Selling
                        </button>
                    </div>
                </div>
            </section>

            {/* 🛍️ FEATURED PRODUCTS SECTION */}
            <section className="py-16 px-4 container mx-auto max-w-7xl">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Featured sustainable goods</h2>
                        <p className="text-gray-500 mt-2">Handpicked for minimal environmental impact.</p>
                    </div>
                    <Link to="/products" className="hidden md:block text-green-600 font-medium hover:text-green-700">
                        View all products &rarr;
                    </Link>
                </div>

                {isLoading ? (
                    <SkeletonGrid count={8} />
                ) : isError ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-xl text-center font-medium">
                        Failed to load featured products.
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 text-gray-500 p-16 rounded-2xl text-center flex flex-col items-center">
                        <span className="text-4xl mb-4">🍃</span>
                        <h3 className="text-xl font-bold text-gray-700">No products available yet</h3>
                        <p className="mb-6">Be the first to list a sustainable product!</p>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-green-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Start Selling Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <Link 
                                to={`/products/${product._id}`} 
                                key={product._id} 
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full"
                            >
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <img 
                                        src={product.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=e2e8f0&color=64748b&size=400`} 
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.sustainabilityScore >= 80 && (
                                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                            Top Rated 🌱
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-green-600 transition-colors">{product.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
                                    
                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                                        <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                            {product.category || 'Goods'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                
                {/* Mobile View All Link */}
                <div className="mt-8 text-center md:hidden">
                    <Link to="/products" className="inline-block bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        View all products
                    </Link>
                </div>
            </section>
            
            {/* 💡 CATEGORIES SECTION */}
            <section className="bg-white py-16 px-4 mt-auto border-t border-gray-100">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {['Zero Waste', 'Organic Apparel', 'Upcycled Goods', 'Renewable Energy'].map(cat => (
                            <Link 
                                to={`/products?category=${encodeURIComponent(cat)}`} 
                                key={cat}
                                className="bg-gray-50 py-8 px-4 rounded-2xl hover:bg-green-50 hover:text-green-700 transition-colors font-medium text-gray-600 border border-transparent hover:border-green-100"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
