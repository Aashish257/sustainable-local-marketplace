import React, { useState } from 'react';
import { useCreateReview } from '../services/reviewQueries';
import StarRating from './StarRating';
import useAuthStore from '../../../store/authStore';
import { Link } from 'react-router-dom';

const ReviewForm = ({ productId }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { isAuthenticated } = useAuthStore();
    
    const { mutate: submitReview, isPending, isSuccess, error } = useCreateReview();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;

        submitReview({ productId, rating, comment }, {
            onSuccess: () => {
                setRating(0);
                setComment("");
            }
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center mb-12">
                <h3 className="text-xl font-bold text-green-800 mb-2">Want to share your experience?</h3>
                <p className="text-green-600 mb-6">Please log in to leave a review for this sustainable product.</p>
                <Link 
                    to="/login" 
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200"
                >
                    Login to Review
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
            
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Write a Review</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Overall Rating</label>
                    <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                    {rating === 0 && <p className="text-xs text-gray-400 mt-2 italic">* Click a star to rate</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Experience</label>
                    <textarea
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                        placeholder="What did you love about this product? Was it truly sustainable?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                        {error.response?.data?.message || "Failed to submit review. You may have already reviewed this product."}
                    </div>
                )}

                {isSuccess && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium animate-bounce">
                        🎉 Review submitted successfully!
                    </div>
                )}

                <button
                    type="submit"
                    disabled={rating === 0 || isPending}
                    className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95"
                >
                    {isPending ? "Submitting..." : "Post Review"}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
