import { useMutation, useQuery } from '@tanstack/react-query';
import { createOrder, getOrderById } from './orderService';

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: createOrder,
    });
};

export const useOrder = (orderId) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: () => getOrderById(orderId),
        enabled: Boolean(orderId),
    });
};
