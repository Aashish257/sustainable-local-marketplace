import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-[#0d0d16] p-4 rounded-xl border border-[#27272A] font-mono space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white text-xs">
                        {review.userId?.name || "ANONYMOUS BUYER"}
                    </h4>
                    <p className="text-xs text-zinc-500">
                        {formatDate(review.createdAt)}
                    </p>
                </div>
                <StarRating rating={review.rating} readOnly size="sm" />
            </div>
            <p className="text-zinc-400 font-sans text-xs leading-relaxed italic">
                "{review.comment}"
            </p>
        </div>
    );
};

export default ReviewItem;

