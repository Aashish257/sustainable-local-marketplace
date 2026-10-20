import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import ImageUploader from '../../../shared/components/ImageUploader';

const CATEGORIES = [
    'Zero Waste',
    'Organic Food',
    'Eco Apparel',
    'Handmade Goods',
    'Home & Garden',
    'Refurbished Tech',
    'Upcycled Goods',
    'Renewable Energy'
];

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Zero Waste',
        stock: '',
        imageUrl: '',
        sustainabilityScore: 8,
        biddingEnabled: false,
        biddingStartingPrice: '',
    });

    const { data: productData, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => apiClient.get(`/products/${id}`).then(r => r.data)
    });

    useEffect(() => {
        if (productData?.data) {
            const p = productData.data;
            setFormData({
                title: p.title || '',
                description: p.description || '',
                price: p.price || '',
                category: p.category || 'Zero Waste',
                stock: p.stock ?? '',
                imageUrl: p.images?.[0] || '',
                sustainabilityScore: p.sustainabilityScore ?? 8,
                biddingEnabled: Boolean(p.biddingEnabled),
                biddingStartingPrice: p.biddingStartingPrice ?? '',
            });
        }
    }, [productData]);

    const mutation = useMutation({
        mutationFn: (updatedProduct) => apiClient.put(`/products/${id}`, updatedProduct),
        onSuccess: (res) => {
            toast.success(res.data?.data?.isApproved === false
                ? 'Product updated. Changes are pending admin approval.'
                : 'Product updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/dashboard/products');
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to update product');
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            stock: Number(formData.stock),
            images: formData.imageUrl ? [formData.imageUrl] : [],
            sustainabilityScore: Number(formData.sustainabilityScore),
            biddingEnabled: Boolean(formData.biddingEnabled),
            biddingStartingPrice: formData.biddingEnabled ? Number(formData.biddingStartingPrice || formData.price) : undefined,
        };

        mutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center text-[var(--text-muted)] font-mono animate-pulse text-xs">
                Loading product specifications...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center text-rose-500 font-mono text-xs">
                Failed to load product specifications.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-6">
            <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CATALOG MANAGEMENT
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)]">Edit Product Listing</h1>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
                    Modify product details, inventory allocation, and live bidding configurations.
                </p>
            </div>

            <div className="glass-card overflow-hidden shadow-xl">
                <form onSubmit={handleSubmit} className="p-7 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Product Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                minLength={3}
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Upcycled Denim Everyday Tote"
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Description &amp; Materials</label>
                            <textarea
                                name="description"
                                required
                                minLength={10}
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the materials, how it was made, and its eco-friendly benefits..."
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] font-sans text-xs focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Retail Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min={1}
                                step="any"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Available Stock Units</label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min={0}
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="10"
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-main)]">{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">
                                Sustainability Rating: {formData.sustainabilityScore}/10
                            </label>
                            <input
                                type="range"
                                name="sustainabilityScore"
                                required
                                min={1}
                                max={10}
                                step="1"
                                value={formData.sustainabilityScore}
                                onChange={handleChange}
                                className="w-full h-2 bg-[var(--border-card)] rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                            />
                            <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] mt-1">
                                <span>1 (Basic)</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formData.sustainabilityScore >= 8 ? 'Exemplary' : 'Moderate'}</span>
                                <span>10 (Fully circular)</span>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Product Image URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full px-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <ImageUploader onUploaded={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} />
                            {formData.imageUrl && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-card)] bg-[var(--bg-page)] flex-shrink-0">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                    </div>
                                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Preview Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Live Auction Toggle */}
                        <div className="col-span-2 glass-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--text-main)] font-display uppercase flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        Enable Real-Time Bidding Auction
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">Allows conscious buyers to place live bids against this listing</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="biddingEnabled"
                                    checked={formData.biddingEnabled}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                />
                            </div>

                            {formData.biddingEnabled && (
                                <div className="mt-3 pt-3 border-t border-[var(--border-card)]">
                                    <label className="block text-xs font-mono font-bold text-[var(--text-main)] uppercase mb-1">Starting Floor Bid (₹)</label>
                                    <input
                                        type="number"
                                        name="biddingStartingPrice"
                                        value={formData.biddingStartingPrice}
                                        onChange={handleChange}
                                        placeholder={formData.price ? `Starting at ₹${formData.price}` : 'Enter starting bid price'}
                                        className="w-full px-3 py-2 bg-[var(--bg-page)] border border-[var(--border-card)] rounded-lg text-[var(--text-main)] font-mono text-xs focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-card)] flex justify-end gap-3 text-xs">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/products')}
                            className="btn-secondary px-4 py-2 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="btn-primary px-6 py-2 uppercase font-semibold disabled:opacity-50 cursor-pointer"
                        >
                            {mutation.isPending ? 'Saving Changes…' : 'Save Changes →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;

