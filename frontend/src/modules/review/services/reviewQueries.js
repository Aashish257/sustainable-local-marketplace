import { useQuery } from '@tanstack/react-query';
import { getReviewsByProduct } from './reviewService';

export const useProductReviews = (productId) => {
    return useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => getReviewsByProduct(productId),
        enabled: !!productId, // Don't run the query if we don't have an ID yet
    });
};
