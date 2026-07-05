import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, updateCartQuantity, removeFromCart, removeAllFromCart } from "@/api/cart";

export interface CartItem {
  id?: string | number;
  item_id?: number;
  productId?: number;
  qty: number;
  weight?: string;
  isOptimistic?: boolean;
  [key: string]: unknown;
}

export interface CartData {
  items: CartItem[];
  [key: string]: unknown;
}

export const useCartMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ productId, qty, weight }: { productId: number; qty: number; weight?: string }) =>
      addToCart(productId, qty, weight),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistic update
      queryClient.setQueryData(["cart"], (old: CartData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: [...(old.items || []), { ...newItem, id: "temp-" + Date.now(), isOptimistic: true }],
        };
      });

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, qty }: { productId: number; qty: number }) => updateCartQuantity(productId, qty),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: CartData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: (old.items || []).map((item: CartItem) =>
            item.item_id === variables.productId ? { ...item, qty: variables.qty } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => removeFromCart(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: CartData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: (old.items || []).filter((item: CartItem) => item.item_id !== productId),
        };
      });

      return { previousCart };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeAllMutation = useMutation({
    mutationFn: () => removeAllFromCart(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: CartData | undefined) => {
        if (!old) return old;
        return { ...old, items: [] };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    addToCart: addMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeFromCart: removeMutation.mutateAsync,
    removeAll: removeAllMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeMutation.isPending,
    isRemovingAll: removeAllMutation.isPending,
  };
};
