import { create } from 'zustand';

// create() gives us a 'set' function we use to update the state
export const useCartStore = create((set) => ({

    // 1. Initial State
    cart: [],

    // 2. Action to add a product
    addToCart: (product) => set((state) => {
        // Check if the product is already in the cart
        const existingItem = state.cart.find(item => item._id === product._id);

        if (existingItem) {
            // It exists! Return a new array where ONLY this item's quantity is increased
            return {
                cart: state.cart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        }

        // It's a new item! Add it to the end of the array with quantity: 1
        return {
            cart: [...state.cart, {
                _id: product._id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] || null,
                quantity: 1
            }]
        };
    }),

}));
