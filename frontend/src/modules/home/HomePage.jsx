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
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-sage-900 text-white py-24 px-4">
                {/* Abstract background shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-32 right-12 w-80 h-80 bg-sage-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-5xl text-center relative z-10 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm font-bold tracking-wider mb-6 backdrop-blur-sm">
                        ✨ THE NEW STANDARD FOR E-COMMERCE
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Shop Sustainably, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-sage-100">Shop Local.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-emerald-50 mb-10 max-w-3xl mx-auto font-light leading-relaxed opacity-90">
                        Discover eco-friendly products crafted by local artisans. Reduce your carbon footprint, one purchase at a time.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => navigate('/products')}
                            className="bg-white text-emerald-900 font-bold text-lg px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-emerald-900/50"
                        >
                            Browse Products
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="glass text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                        >
                            Start Selling
                        </button>
                    </div>
                </div>
            </section>

            {/* 🛍️ FEATURED PRODUCTS SECTION */}
            <section className="py-20 px-4 container mx-auto max-w-7xl relative z-20 -mt-10">
                <div className="flex justify-between items-end mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Featured sustainable goods</h2>
                        <p className="text-slate-500 mt-2 font-medium">Handpicked for minimal environmental impact.</p>
                    </div>
                    <Link to="/products" className="hidden md:block text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
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
                    <div className="glass soft-shadow border-gray-200 text-gray-500 p-16 rounded-3xl text-center flex flex-col items-center">
                        <span className="text-5xl mb-4">🍃</span>
                        <h3 className="text-2xl font-black text-slate-700 mb-2">No products available yet</h3>
                        <p className="mb-8 font-medium">Be the first to list a sustainable product!</p>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Start Selling Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <Link 
                                to={`/products/${product._id}`} 
                                key={product._id} 
                                className="group bg-white rounded-3xl overflow-hidden soft-shadow hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100/50 flex flex-col h-full animate-fade-in-up"
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div className="h-56 bg-slate-100 relative overflow-hidden">
                                    <img 
                                        src={product.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=e2e8f0&color=64748b&size=400`} 
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {product.sustainabilityScore >= 80 && (
                                        <div className="absolute top-4 left-4 glass text-emerald-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm tracking-wide">
                                            TOP RATED 🌱
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
                                    <h3 className="text-xl font-black text-slate-800 line-clamp-1 mb-2 group-hover:text-emerald-600 transition-colors">{product.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow font-medium leading-relaxed">{product.description}</p>
                                    
                                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                            <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                                        </div>
                                        <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-bold border border-slate-100">
                                            {product.category || 'Goods'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                
                {/* Mobile View All Link */}
                <div className="mt-12 text-center md:hidden">
                    <Link to="/products" className="inline-block bg-white border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors soft-shadow">
                        View all products
                    </Link>
                </div>
            </section>
            
            {/* 💡 CATEGORIES SECTION */}
            <section className="py-20 px-4 mt-auto">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-3xl font-black text-slate-800 mb-10 text-center tracking-tight">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { name: 'Zero Waste', color: 'from-emerald-50 to-emerald-100 text-emerald-800' },
                            { name: 'Organic Apparel', color: 'from-sage-50 to-sage-100 text-sage-800' },
                            { name: 'Upcycled Goods', color: 'from-blue-50 to-blue-100 text-blue-800' },
                            { name: 'Renewable Energy', color: 'from-amber-50 to-amber-100 text-amber-800' }
                        ].map((cat, idx) => (
                            <Link 
                                to={`/products?category=${encodeURIComponent(cat.name)}`} 
                                key={cat.name}
                                className={`bg-gradient-to-br ${cat.color} py-10 px-6 rounded-3xl hover:scale-105 transition-all duration-300 font-black text-lg soft-shadow border border-white/50 animate-fade-in-up`}
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
