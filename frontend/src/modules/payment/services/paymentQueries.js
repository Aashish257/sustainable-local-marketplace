import { useMutation } from '@tanstack/react-query';
import { createPayment, verifyPayment } from './paymentService';

export const useCreatePayment = () => useMutation({ mutationFn: createPayment });
export const useVerifyPayment = () => useMutation({ mutationFn: verifyPayment });
