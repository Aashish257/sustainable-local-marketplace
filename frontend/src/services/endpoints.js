
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
    GET_ALL: "/reviews",
    ADD: "/reviews",
    UPDATE: "/reviews/:id",
    DELETE: "/reviews/:id",
    GET_ONE: "/reviews/:id",
    GET_BY_PRODUCT: "/reviews/product/:productId",
    GET_BY_USER: "/reviews/user/:userId",
}