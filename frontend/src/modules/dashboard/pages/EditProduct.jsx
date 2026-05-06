import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';

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
        sustainabilityScore: 5
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
                sustainabilityScore: p.sustainabilityScore ?? 5
            });
        }
    }, [productData]);

    const mutation = useMutation({
        mutationFn: (updatedProduct) => apiClient.patch(`/products/${id}`, updatedProduct),
        onSuccess: () => {
            toast.success('Product updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            navigate('/dashboard/products');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update product');
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            sustainabilityScore: Number(formData.sustainabilityScore)
        };

        mutation.mutate(payload);
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading product data...</div>;
    }

    if (isError) {
        return <div className="text-center py-10 text-red-500">Failed to load product.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
                <p className="text-gray-500 mt-2">Update your sustainable item listing.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                minLength={3}
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                required
                                minLength={10}
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min={1}
                                step="any"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Stock</label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min={0}
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                            >
                                <option value="Zero Waste">Zero Waste</option>
                                <option value="Organic Apparel">Organic Apparel</option>
                                <option value="Upcycled Goods">Upcycled Goods</option>
                                <option value="Renewable Energy">Renewable Energy</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sustainability Score (0-10)
                            </label>
                            <input
                                type="number"
                                name="sustainabilityScore"
                                required
                                min={0}
                                max={10}
                                step="0.1"
                                value={formData.sustainabilityScore}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/products')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
