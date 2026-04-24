const ProductGallery = ({ images, title }) => {
    // If the product has no images, show a placeholder
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No Image Available
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Thumbnail Row (if there are multiple images) */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer border hover:border-green-500">
                            <img src={img} alt={`${title} ${index}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
