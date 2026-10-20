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
            <div className="bg-[#0d0d16] p-6 rounded-2xl border border-[#27272A] text-center mb-8 font-mono">
                <h3 className="text-sm font-bold text-white mb-1 uppercase">LEAVE AUDITED FEEDBACK</h3>
                <p className="text-xs text-zinc-500 mb-4 font-sans">Authenticate identity claims to submit a verified product audit review.</p>
                <Link 
                    to="/login" 
                    className="btn-primary inline-flex items-center gap-2 text-xs uppercase"
                >
                    AUTHENTICATE TO REVIEW →
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#0d0d16] p-6 rounded-2xl border border-[#27272A] mb-8 font-mono">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#27272A]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    WRITE A REVIEW
                </h3>
                <span className="text-xs text-zinc-500">PEER VERIFICATION</span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">RATING SCORE</label>
                    <StarRating rating={rating} onRatingChange={setRating} size="md" />
                    {rating === 0 && <p className="text-xs text-zinc-500 mt-1.5 font-sans">* Select star rating 1 to 5</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">EXPERIENCE &amp; VERIFICATION LOG</label>
                    <textarea
                        rows="3"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#020206] border border-[#27272A] text-white font-sans text-xs focus:border-[#F59E0B] focus:outline-none transition-all resize-none leading-relaxed"
                        placeholder="Detail materials, build quality, delivery packaging sustainability, and usage lifespan..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-rose-950/40 text-rose-400 border border-rose-800 rounded-lg text-xs font-bold">
                        {error.response?.data?.error || "Failed to submit review. You may have already reviewed this product."}
                    </div>
                )}

                {isSuccess && (
                    <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                        <span>✓</span> Review published to catalog!
                    </div>
                )}

                <button
                    type="submit"
                    disabled={rating === 0 || isPending}
                    className="btn-primary text-xs uppercase px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isPending ? "SIGNING AUDIT…" : "PUBLISH REVIEW →"}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;

