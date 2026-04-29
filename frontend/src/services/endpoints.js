
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
}

export const PAYMENTS = {
    CREATE: "/payments/create",
    VERIFY: "/payments/verify",
}