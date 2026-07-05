import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWishlist, removeWishlist } from "@/api/cart"; // Wishlist logic is in cart.ts right now

export const useWishlistMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (productId: number) => addWishlist(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [...(old.items || []), { item_id: productId, isOptimistic: true }],
        };
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["wishlist"], context?.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => removeWishlist(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: (old.items || []).filter((item: any) => item.item_id !== productId),
        };
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["wishlist"], context?.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return {
    addToWishlist: addMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
