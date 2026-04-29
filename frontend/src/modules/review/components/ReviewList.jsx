import React from 'react';
import { useGetReviews } from '../services/reviewQueries';
import ReviewItem from './ReviewItem';

const ReviewList = ({ productId }) => {
    const { data: reviewsData, isLoading, isError } = useGetReviews(productId);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-gray-50 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (isError) {
        return <p className="text-red-500 text-center py-4">Failed to load reviews.</p>;
    }

    const reviews = reviewsData?.data || [];

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                Customer Feedback 
                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {reviews.length}
                </span>
            </h3>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
