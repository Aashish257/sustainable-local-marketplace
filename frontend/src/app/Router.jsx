import { Route, Routes } from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import RegisterPage from "../modules/auth/RegisterPage";
import ProtectedRoute from "../shared/layout/ProtectedRoute";
import ProductList from "../modules/product/pages/ProductList";
import ProductDetail from "../modules/product/pages/ProductDetail";
import CartPage from "../modules/cart/pages/CartPage";
import CheckoutPage from "../modules/order/pages/CheckoutPage";
import PaymentPage from "../modules/payment/pages/PaymentPage";
import SuccessPage from "../modules/payment/pages/SuccessPage";


const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<div className="p-4 text-xl">🏠 Home — Protected ✅</div>} />
                <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage />} />
        </Routes>
    );
};

export default Router;