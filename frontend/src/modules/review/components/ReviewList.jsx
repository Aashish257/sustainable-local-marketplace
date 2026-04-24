import { useProductReviews } from '../services/reviewQueries';

const ReviewList = ({ productId }) => {
    // 1. Fetch the reviews!
    const { data, isLoading, isError } = useProductReviews(productId);

    // 2. Loading Skeleton (Task 9 Requirement)
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 h-24 rounded-lg w-full"></div>
                ))}
            </div>
        );
    }

    if (isError) return <div className="text-red-500">Failed to load reviews.</div>;

    // The backend usually returns the array in data.data
    const reviews = data?.data || [];

    // 3. Empty State Handling
    if (reviews.length === 0) {
        return (
            <div className="text-gray-500 italic py-8">
                No reviews yet. Be the first to review this product!
            </div>
        );
    }

    // 4. Render the Reviews
    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6 border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        {/* Avatar Circle */}
                        <div className="bg-green-100 text-green-800 font-bold rounded-full w-10 h-10 flex items-center justify-center uppercase">
                            {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous User'}</p>
                            {/* Star Rating Logic */}
                            <div className="flex text-yellow-400 text-sm tracking-widest">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
