import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAddress, deleteAddress, editAddress } from "@/api/auth";
import { useUserStore } from "@/store/userStore";

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const { user, setUser, updateAddressInUser, removeAddressFromUser, fetchUser } = useUserStore();

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (data) => {
      const newAddr = data?.data ?? data?.address ?? data;
      if (newAddr && typeof newAddr === "object" && newAddr.id) {
        setUser({
          ...user,
          addresses: [...(user?.addresses || []), newAddr],
        });
      } else {
        fetchUser();
      }
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
    // Note: Error toast is handled globally in queryClient.ts
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: ["addresses", user?.id] });
      const previousUser = { ...user };
      
      // Optimistic update
      removeAddressFromUser(addressId);

      return { previousUser };
    },
    onError: (err, addressId, context) => {
      // Rollback
      if (context?.previousUser) {
        setUser(context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });

  const editMutation = useMutation({
    mutationFn: editAddress,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["addresses", user?.id] });
      const previousUser = { ...user };

      if (variables?.id) {
        // Optimistic update
        updateAddressInUser(variables.id, {
          f_name: variables.f_name,
          l_name: variables.l_name,
          email: variables.email,
          phone: variables.phone,
          city: variables.city,
          state: variables.state ?? "",
          home_phone: variables.home_phone ?? "",
        });
      }

      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousUser) {
        setUser(context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });

  return {
    createMutation,
    deleteMutation,
    editMutation,
  };
}
