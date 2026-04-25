import { Link } from 'react-router-dom';

const SuccessPage = () => {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                ✓
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">Thank you for your sustainable purchase. Your order is being processed.</p>
            <Link to="/products" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                Continue Shopping
            </Link>
        </div>
    );
};

export default SuccessPage;
