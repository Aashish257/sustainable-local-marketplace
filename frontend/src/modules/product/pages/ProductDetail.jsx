import { useParams } from 'react-router-dom';
import { useProduct } from '../services/productQueries';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import AddToCart from '../components/AddToCart';
import ReviewList from '../../review/components/ReviewList';
import ReviewForm from '../../review/components/ReviewForm';


const ProductDetail = () => {
    const { id } = useParams();

    // Fetch the product data!
    const { data, isLoading, isError } = useProduct(id);

    if (isLoading) return <div className="text-center py-20">Loading Product...</div>;
    if (isError || !data?.data) return <div className="text-center py-20 text-red-500">Product not found</div>;

    const product = data.data;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* TOP SECTION: Images on Left, Info on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

                {/* LEFT: Product Images (Placeholder) */}
                <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                    <ProductGallery images={product.images} title={product.title} />
                </div>

                {/* RIGHT: Product Info + Add to Cart (Placeholder) */}
                <div className="flex flex-col">
                    <ProductInfo product={product} />

                    <div className="mt-auto">
                        <AddToCart product={product} />
                    </div>
                </div>

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
