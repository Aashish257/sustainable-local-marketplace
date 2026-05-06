import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import { PRODUCTS } from '../../../services/endpoints';

const AddProduct = () => {
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

    const mutation = useMutation({
        mutationFn: (newProduct) => apiClient.post(PRODUCTS, newProduct),
        onSuccess: () => {
            toast.success('Product listed successfully!');
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            navigate('/dashboard/products');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to list product');
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
        
        // Format data to match backend schema expectations
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

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
                <p className="text-gray-500 mt-2">List a new sustainable item on the marketplace.</p>
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
                                placeholder="e.g. Upcycled Denim Jacket"
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
                                placeholder="Describe the materials, how it was made, and its eco-friendly benefits..."
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
                                placeholder="0.00"
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
                                placeholder="10"
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
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Provide a direct link to an image (e.g. from Unsplash or Imgur).</p>
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
                            {mutation.isPending ? 'Publishing...' : 'Publish Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
