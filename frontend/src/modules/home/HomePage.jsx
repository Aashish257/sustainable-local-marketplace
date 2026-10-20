import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { PRODUCTS } from '../../services/endpoints';
import { SkeletonGrid } from '../../shared/components/SkeletonLoader';
import ProductCard from '../product/components/ProductCard';

const CATEGORIES = [
    { name: 'Zero Waste', code: '01' },
    { name: 'Organic Food', code: '02' },
    { name: 'Eco Apparel', code: '03' },
    { name: 'Renewable Energy', code: '04' },
    { name: 'Handmade Goods', code: '05' },
    { name: 'Upcycled Goods', code: '06' },
    { name: 'Home & Garden', code: '07' },
    { name: 'Refurbished Tech', code: '08' },
];

const HomePage = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => apiClient.get(PRODUCTS.GET_ALL, { params: { limit: 8 } }).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const products = data?.data || [];

    return (
        <div className="min-h-screen flex flex-col bg-[#020206] text-white font-mono relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-[20dvh] left-[-10vw] w-[45vw] h-[45vw] rounded-full bg-[#F59E0B]/5 blur-3xl pointer-events-none z-0" />
            <div className="absolute top-[70dvh] right-[-10vw] w-[35vw] h-[35vw] rounded-full bg-[#FBBF24]/5 blur-3xl pointer-events-none z-0" />

            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden text-white bg-[#020206] py-16 border-b border-[#27272A] z-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="bg-[#0d0d16] border border-[#27272A] p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="inline-flex items-center gap-2 bg-[#020206] border border-[#27272A] text-[#F59E0B] text-xs px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse" />
                            INFRASTRUCTURE OVERVIEW // VERIFIED LOCAL COMMERCE
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black mb-4 font-sans tracking-tight text-white leading-tight">
                            Autonomous Sustainable Commerce Mesh
                        </h1>

                        <p className="text-sm md:text-base text-zinc-400 mb-8 font-sans leading-relaxed max-w-2xl">
                            Discover verified local producers, compare real-time carbon indices, participate in live auction order books, and make audited purchases that measurably lower carbon footprints.
                        </p>

                        <div className="flex flex-wrap gap-4 font-mono text-xs">
                            <button
                                onClick={() => navigate('/products')}
                                className="btn-primary px-6 py-3 uppercase font-bold cursor-pointer"
                            >
                                EXPLORE CATALOG →
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-secondary px-6 py-3 uppercase font-bold cursor-pointer"
                            >
                                START SELLING
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="py-16 px-4 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex justify-between items-end mb-8 pb-3 border-b border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2 text-[#F59E0B] text-xs uppercase mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                CURATED TELEMETRY
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Verified Sustainable Catalog</h2>
                        </div>
                        <Link to="/products" className="text-xs text-[#F59E0B] hover:text-[#FBBF24] transition-colors uppercase font-bold">
                            VIEW ALL PRODUCTS →
                        </Link>
                    </div>

                    {isLoading ? (
                        <SkeletonGrid count={8} />
                    ) : isError ? (
                        <div className="bg-[#0d0d16] border border-rose-800 text-rose-400 p-8 rounded-2xl text-center text-xs">
                            Couldn't load products. Please try again.
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-[#0d0d16] border border-[#27272A] text-zinc-400 p-12 rounded-2xl text-center text-xs">
                            <p className="mb-4">No products yet.</p>
                            <button onClick={() => navigate('/register')} className="btn-primary text-xs uppercase">
                                LIST THE FIRST PRODUCT
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== CATEGORIES ===== */}
            <section className="py-16 px-4 bg-[#08080f] border-t border-b border-[#27272A] relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-8">
                        <div className="text-[#F59E0B] text-xs uppercase mb-1">CATEGORIES</div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Catalog Categorization</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => (
                            <Link
                                to={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                                key={cat.name}
                                className="bg-[#0d0d16] border border-[#27272A] hover:border-[#F59E0B] p-4 rounded-xl transition-all group"
                            >
                                <div className="text-xs text-zinc-500 mb-1">{cat.code}</div>
                                <div className="text-xs font-bold text-white group-hover:text-[#FBBF24] transition-colors">{cat.name}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;

