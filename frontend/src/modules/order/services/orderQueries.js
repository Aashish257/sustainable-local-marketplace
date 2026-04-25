import { useMutation } from '@tanstack/react-query';
import { createOrder } from './orderService';

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: createOrder,
    });
};
