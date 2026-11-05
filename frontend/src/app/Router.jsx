import RoleRoute from "../shared/layout/RoleRoute";
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
import PaymentFailurePage from "../modules/payment/pages/PaymentFailurePage";
import SuccessPage from "../modules/payment/pages/SuccessPage";
import { SkeletonGrid } from "../shared/components/SkeletonLoader";
import HomePage from "../modules/home/HomePage";
import LandingPage from "../modules/home/LandingPage";
import AboutPage from "../modules/home/AboutPage";
import HowItWorksPage from "../modules/home/HowItWorksPage";
import NotFoundPage from "../modules/home/NotFoundPage";

const MyOrders = lazy(() => import("../modules/order/pages/MyOrders"));
const OrderDetail = lazy(() => import("../modules/order/pages/OrderDetail"));
const ChatPage = lazy(() => import("../modules/chat/pages/ChatPage"));
const ProfilePage = lazy(() => import("../modules/auth/ProfilePage"));
const NotificationsPage = lazy(() => import("../modules/order/pages/NotificationsPage"));

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
const AuctionsPage = lazy(() => import("../modules/bid/pages/AuctionsPage"));

const Router = () => {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-12"><SkeletonGrid count={4} /></div>}>
            <Routes>
                {/* Guest Routes (Only accessible if NOT logged in) */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* SHOP: guests + buyers. Sellers/admins are sent to their dashboard */}
                <Route element={<RoleRoute allow={["buyer"]} guests />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/marketplace" element={<ProductList />} />
                    <Route path="/auctions" element={<AuctionsPage />} />
                </Route>

                {/* BUYER ONLY: cart, checkout, payment, purchase history */}
                <Route element={<RoleRoute allow={["buyer"]} />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/payment/success" element={<SuccessPage />} />
                    <Route path="/payment/failure" element={<PaymentFailurePage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                </Route>

                {/* SELLER ONLY */}
                <Route element={<RoleRoute allow={["seller"]} />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="products/new" element={<AddProduct />} />
                        <Route path="products/add" element={<AddProduct />} />
                        <Route path="products/edit/:id" element={<EditProduct />} />
                        <Route path="products/:id/edit" element={<EditProduct />} />
                        <Route path="products/:id/preview" element={<ProductDetail />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="orders/:orderId" element={<OrderDetail />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="messages" element={<ChatPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* ADMIN ONLY */}
                <Route element={<RoleRoute allow={["admin"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="orders/:orderId" element={<OrderDetail />} />
                        <Route path="analytics" element={<Analytics />} />
                    </Route>
                </Route>

                {/* ANY LOGGED-IN USER */}
                <Route element={<RoleRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/messages" element={<ChatPage />} />
                </Route>

                {/* EVERYONE: product detail (buy/bid actions only for buyers), info pages */}
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />

                {/* 404 Catch-All */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default Router;