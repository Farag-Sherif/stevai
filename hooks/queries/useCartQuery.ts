import { useQuery } from "@tanstack/react-query";
import { getCart, getWishlistItems } from "@/api/cart";

export const useCartQuery = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
};

export const useWishlistQuery = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistItems,
  });
};
