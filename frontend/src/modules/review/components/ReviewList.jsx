import React from 'react';
import { useGetReviews } from '../services/reviewQueries';
import ReviewItem from './ReviewItem';

const ReviewList = ({ productId }) => {
    const { data: reviewsData, isLoading, isError } = useGetReviews(productId);

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-[#0d0d16] border border-[#27272A] rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (isError) {
        return <p className="text-rose-400 font-mono text-xs text-center py-4">FAILED TO LOAD REVIEWS FROM AUDIT STREAM.</p>;
    }

    const reviews = reviewsData?.data || [];

    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 bg-[#0d0d16] rounded-2xl border border-[#27272A] p-6 font-mono">
                <p className="text-zinc-500 text-xs">No reviews yet. Buyers can review after purchase.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 font-mono">
            <h3 className="text-sm font-bold mb-4 text-white flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                AUDITED COMMUNITY FEEDBACK 
                <span className="text-xs text-[#F59E0B] bg-[#020206] border border-[#27272A] px-2 py-0.5 rounded-full font-bold">
                    {reviews.length} ENTRIES
                </span>
            </h3>
            <div className="space-y-3">
                {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewList;

