import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../services/productQueries';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import AddToCart from '../components/AddToCart';
import ReviewList from '../../review/components/ReviewList';
import ReviewForm from '../../review/components/ReviewForm';
import BidPanel from '../../bid/components/BidPanel';
import ChatBox from '../../chat/components/ChatBox';
import useAuthStore from '../../../store/authStore';
import { SkeletonDetail } from '../../../shared/components/SkeletonLoader';


const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useProduct(id);

    if (isLoading) return <SkeletonDetail />;
    if (isError || !data?.data) return <div className="text-center py-20 text-red-500">Product not found</div>;

    const product = data.data;

    const [isChatOpen, setIsChatOpen] = useState(false);

    // Seller ID from product — used for the ChatBox
    const sellerId = product.sellerId?._id || product.sellerId;
    const sellerName = product.sellerId?.name || "Seller";

    // Don't show chat to the seller themselves
    const isOwnProduct = user?.id === sellerId?.toString();

    return (
        <div className="container mx-auto px-4 py-8 relative">
            {/* TOP SECTION: Images on Left, Info on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">

                {/* LEFT: Product Images */}
                <div>
                    <ProductGallery images={product.images} title={product.title} />
                </div>

                {/* RIGHT: Product Info + Add to Cart */}
                <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl soft-shadow border border-slate-100">
                    <ProductInfo product={product} />
                    <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-6">
                        <AddToCart product={product} />
                        
                        {/* Chat with Seller Button */}
                        {!isOwnProduct && (
                            <button
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className="w-full flex justify-center items-center gap-2 py-4 px-4 border-2 border-emerald-100 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300"
                            >
                                💬 {isChatOpen ? 'Close Chat' : 'Chat with Seller'}
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* LIVE AUCTION & CHAT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Bidding Panel - ONLY VISIBLE IF BIDDING IS ENABLED */}
                {product.biddingEnabled && (
                    <div className="animate-fade-in-up">
                        <BidPanel product={product} />
                    </div>
                )}

                {/* ChatBox - Toggled via button */}
                {isChatOpen && !isOwnProduct && (
                    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 shadow-2xl rounded-3xl animate-fade-in-up border border-white/20 glass overflow-hidden">
                        <div className="flex justify-between items-center bg-emerald-600/90 backdrop-blur-md px-6 py-4 relative z-10 border-b border-emerald-500/50">
                            <span className="text-white font-black tracking-wide text-sm">💬 Chat with {sellerName}</span>
                            <button onClick={() => setIsChatOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                                ✖
                            </button>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md">
                            <ChatBox
                                receiverId={sellerId}
                                receiverName={sellerName}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM SECTION: Reviews */}
            <div className="border-t pt-10">
                <ReviewForm productId={product._id} />
                <ReviewList productId={product._id} />
            </div>
        </div>
    );
};

export default ProductDetail;
