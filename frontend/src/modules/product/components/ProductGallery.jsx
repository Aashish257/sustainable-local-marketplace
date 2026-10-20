import { useState, useEffect } from 'react';

const ProductGallery = ({ images, title }) => {
    const validImages = images && images.length > 0 ? images : [];
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(0);
    }, [images]);

    if (validImages.length === 0) {
        return (
            <div className="w-full aspect-square bg-[#0d0d16] rounded-2xl flex flex-col items-center justify-center text-zinc-500 border border-[#27272A] font-mono">
                <svg className="w-12 h-12 mb-2 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">NO VISUAL FEED</span>
            </div>
        );
    }

    const currentImage = validImages[selectedIndex] || validImages[0];

    return (
        <div className="w-full">
            {/* Main Hero Image */}
            <div className="aspect-square bg-[#020206] rounded-2xl overflow-hidden mb-3 border border-[#27272A] shadow-md relative group">
                <img
                    src={currentImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Thumbnail Row */}
            {validImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {validImages.map((img, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className={`aspect-square rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                                selectedIndex === index
                                    ? 'border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-95'
                                    : 'border-[#27272A] opacity-60 hover:opacity-100 hover:border-zinc-500'
                            }`}
                        >
                            <img src={img} alt={`${title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;

