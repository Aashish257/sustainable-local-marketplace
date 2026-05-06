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
import HomePage from "../modules/home/HomePage";

import GuestRoute from "../shared/layout/GuestRoute";

// Lazy loaded — Dashboard is only downloaded when user visits /dashboard
const DashboardLayout = lazy(() => import("../modules/dashboard/layout/DashboardLayout"));
const DashboardHome = lazy(() => import("../modules/dashboard/pages/DashboardHome"));
const SellerProducts = lazy(() => import("../modules/dashboard/pages/SellerProducts"));
const AddProduct = lazy(() => import("../modules/dashboard/pages/AddProduct"));
const EditProduct = lazy(() => import("../modules/dashboard/pages/EditProduct"));
const SellerOrders = lazy(() => import("../modules/dashboard/pages/SellerOrders"));
const Analytics = lazy(() => import("../modules/dashboard/pages/Analytics"));

// Admin
const AdminLayout = lazy(() => import("../modules/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("../modules/admin/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("../modules/admin/pages/AdminUsers"));
const AdminProducts = lazy(() => import("../modules/admin/pages/AdminProducts"));
const AdminOrders = lazy(() => import("../modules/admin/pages/AdminOrders"));

const Router = () => {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-12"><SkeletonGrid count={4} /></div>}>
            <Routes>
                {/* Guest Routes (Only accessible if NOT logged in) */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/success" element={<SuccessPage />} />

                    {/* Dashboard — lazy loaded, seller only (RBAC inside DashboardLayout) */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="products/add" element={<AddProduct />} />
                        <Route path="products/edit/:id" element={<EditProduct />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="analytics" element={<Analytics />} />
                    </Route>

                    {/* Admin Panel (RBAC inside AdminLayout) */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                    </Route>
                </Route>

                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
            </Routes>
        </Suspense>
    );
};

export default Router;