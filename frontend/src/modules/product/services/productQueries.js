import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
} from './productService';

// 1. Custom Hook for Fetching Products (with filters)
export const useProducts = (filters) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => getProducts(filters),
        placeholderData: (previousData) => previousData,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// 2. Custom Hook for Fetching a Single Product
export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: !!id,
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// 3. Custom Hook for Creating a Product
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // After successful creation, we need to tell React Query to refresh the list.
            // We invalidate the 'products' query cache.
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        // onError and onMutate can be added here for better UX (loading states, error messages)
    });
};

// 4. Custom Hook for Updating a Product
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: (_, { id }) => {
            // When updating, we invalidate both the list and the single item cache
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
        },
    });
};

// 5. Custom Hook for Deleting a Product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            // Refresh the list after deletion
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// 6. Custom Hook for Fetching Categories
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
};
