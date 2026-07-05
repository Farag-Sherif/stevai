import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAndSyncCart } from "@/api/auth";

export const useAuthMutations = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ formData, cartItems }: { formData: FormData; cartItems: any[] }) =>
      loginAndSyncCart(formData, cartItems),
    onSuccess: (data) => {
      // Invalidate cart and wishlist queries when user logs in
      if (data?.user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      }
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
};
