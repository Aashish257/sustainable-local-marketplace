import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviewsByProduct, createReview } from "./reviewService";

export const useGetReviews = (productId) => {
    return useQuery({
        queryKey: ["reviews", productId],
        queryFn: () => getReviewsByProduct(productId),
        enabled: !!productId,
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (data) => {
            // Invalidate reviews for this specific product
            queryClient.invalidateQueries({ queryKey: ["reviews", data.data.productId] });
            // Also invalidate product detail to update average rating/total reviews
            queryClient.invalidateQueries({ queryKey: ["product", data.data.productId] });
        },
    });
};
