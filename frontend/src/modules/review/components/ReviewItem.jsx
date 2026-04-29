import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">
                        {review.userId?.name || "Anonymous Buyer"}
                    </h4>
                    <p className="text-sm text-gray-400 font-medium">
                        {formatDate(review.createdAt)}
                    </p>
                </div>
                <StarRating rating={review.rating} readOnly size="sm" />
            </div>
            <p className="text-gray-600 leading-relaxed italic">
                "{review.comment}"
            </p>
        </div>
    );
};

export default ReviewItem;
