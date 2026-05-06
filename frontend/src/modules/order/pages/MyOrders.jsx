import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { ORDERS } from '../../services/endpoints';
import { SkeletonGrid } from '../../shared/components/SkeletonLoader';
import { Link } from 'react-router-dom';

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700'
};

const MyOrders = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => apiClient.get(ORDERS.MY).then(r => r.data)
    });

    if (isLoading) return <div className="container mx-auto px-4 py-8 max-w-4xl"><SkeletonGrid count={3} /></div>;
    
    if (isError) return (
        <div className="container mx-auto px-4 py-20 text-center text-red-500">
            Failed to load order history. Please try again later.
        </div>
    );

    const orders = data?.data || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <span className="text-4xl mb-4 block">🛍️</span>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't made any sustainable purchases yet!</p>
                    <Link 
                        to="/products"
                        className="inline-block bg-green-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Order Header */}
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                                        <p className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                                        <p className="text-sm font-bold text-gray-800">₹{order.totalAmount?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order ID</p>
                                        <p className="text-sm font-bold text-gray-800 font-mono">{order._id.slice(-8)}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-4 divide-y divide-gray-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="py-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            {item.productId?.images?.[0] ? (
                                                <img src={item.productId.images[0]} alt={item.productId.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Link to={`/products/${item.productId?._id}`} className="font-bold text-gray-800 hover:text-green-600 transition-colors line-clamp-1">
                                                {item.productId?.title || 'Unknown Product'}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">₹{item.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Action Row */}
                            {order.status === 'pending' && (
                                <div className="bg-amber-50 px-6 py-3 border-t border-amber-100 flex justify-end">
                                    <Link 
                                        to={`/payment/${order._id}`}
                                        className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                    >
                                        Complete Payment
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
