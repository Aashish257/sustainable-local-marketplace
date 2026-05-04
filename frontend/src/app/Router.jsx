import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoginPage from "../modules/auth/LoginPage";
import RegisterPage from "../modules/auth/RegisterPage";
import ProtectedRoute from "../shared/layout/ProtectedRoute";
import ProductList from "../modules/product/pages/ProductList";
import ProductDetail from "../modules/product/pages/ProductDetail";
import CartPage from "../modules/cart/pages/CartPage";
import CheckoutPage from "../modules/order/pages/CheckoutPage";
import PaymentPage from "../modules/payment/pages/PaymentPage";
import SuccessPage from "../modules/payment/pages/SuccessPage";
import { SkeletonGrid } from "../shared/components/SkeletonLoader";

// Lazy loaded — Dashboard is only downloaded when user visits /dashboard
const DashboardLayout = lazy(() => import("../modules/dashboard/layout/DashboardLayout"));
const DashboardHome = lazy(() => import("../modules/dashboard/pages/DashboardHome"));
const SellerProducts = lazy(() => import("../modules/dashboard/pages/SellerProducts"));
const SellerOrders = lazy(() => import("../modules/dashboard/pages/SellerOrders"));
const Analytics = lazy(() => import("../modules/dashboard/pages/Analytics"));

const Router = () => {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-12"><SkeletonGrid count={4} /></div>}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<div className="p-4 text-xl">🏠 Home — Protected ✅</div>} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/success" element={<SuccessPage />} />

                    {/* Dashboard — lazy loaded, seller only (RBAC inside DashboardLayout) */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="analytics" element={<Analytics />} />
                    </Route>
                </Route>

                {/* Public Routes */}
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
            </Routes>
        </Suspense>
    );
};

export default Router;