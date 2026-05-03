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


const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();

    // Fetch the product data!
    const { data, isLoading, isError } = useProduct(id);

    if (isLoading) return <div className="text-center py-20">Loading Product...</div>;
    if (isError || !data?.data) return <div className="text-center py-20 text-red-500">Product not found</div>;

    const product = data.data;

    // Seller ID from product — used for the ChatBox
    const sellerId = product.sellerId?._id || product.sellerId;
    const sellerName = product.sellerId?.name || "Seller";

    // Don't show chat to the seller themselves
    const isOwnProduct = user?.id === sellerId?.toString();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* TOP SECTION: Images on Left, Info on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">

                {/* LEFT: Product Images */}
                <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                    <ProductGallery images={product.images} title={product.title} />
                </div>

                {/* RIGHT: Product Info + Add to Cart */}
                <div className="flex flex-col gap-4">
                    <ProductInfo product={product} />
                    <div className="mt-auto">
                        <AddToCart product={product} />
                    </div>
                </div>

            </div>

            {/* LIVE AUCTION & CHAT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Bidding Panel */}
                <BidPanel product={product} />

                {/* Chat with Seller (hidden if viewing your own product) */}
                {!isOwnProduct && (
                    <ChatBox
                        receiverId={sellerId}
                        receiverName={sellerName}
                    />
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
