import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            // 1. Initial State
            cart: [],

            // 2. Add to Cart (from yesterday, unchanged logic)
            addToCart: (product) => set((state) => {
                const existingItem = state.cart.find(item => item._id === product._id);

                if (existingItem) {
                    return {
                        cart: state.cart.map(item =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    };
                }

                return {
                    cart: [...state.cart, {
                        _id: product._id,
                        title: product.title,
                        price: product.price,
                        image: product.image || product.images?.[0] || null,
                        quantity: 1
                    }]
                };
            }),

            // 3. Remove Item entirely
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item._id !== productId)
            })),

            // 4. Update Quantity (Prevent going below 1)
            updateQuantity: (productId, amount) => set((state) => ({
                cart: state.cart.map(item => {
                    if (item._id === productId) {
                        const newQuantity = item.quantity + amount;
                        // Prevent quantity from dropping below 1
                        return { ...item, quantity: newQuantity < 1 ? 1 : newQuantity };
                    }
                    return item;
                })
            })),

            // 5. Clear Cart (used after successful payment!)
            clearCart: () => set({ cart: [] }),

            // 6. Calculate Cart Total Amount
            // Remember: This is just for UI display. The Backend will recalculate the real total during checkout!
            getCartTotal: () => {
                const state = get();
                return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'sustainable-cart-storage', // name of the item in localStorage
        }
    )
);
