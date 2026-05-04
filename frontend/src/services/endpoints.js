
// Created Endpoints from Frontend
export const AUTH = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
}

export const PRODUCTS = {
    GET_ALL: "/products",
    ADD: "/products",
    UPDATE: "/products/:id",
    DELETE: "/products/:id",
    GET_ONE: "/products/:id",
    CATEGORIES: "/products/categories",
}

export const REVIEWS = {
    ADD: "/reviews",
    GET_BY_PRODUCT: "/reviews/:productId",
}

export const ORDERS = {
    CREATE: "/orders",
    MY: "/orders/my",
    SELLER: "/orders/seller",
}

export const PRODUCTS_MINE = "/products/mine";

export const PAYMENTS = {
    CREATE: "/payments/create",
    VERIFY: "/payments/verify",
}

export const MESSAGES = {
    GET_HISTORY: "/messages/:receiverId",
}

export const BIDS = {
    GET_HIGHEST: "/bids/:productId",
}