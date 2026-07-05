import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, updateUserPassword } from "@/api/auth";
import { useUserStore } from "@/store/userStore";

export function useProfileMutations() {
  const queryClient = useQueryClient();
  const { fetchUser, setUser, user } = useUserStore();

  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async (response, variables) => {
      const ok =
        response?.status === "success" ||
        response?.success === true ||
        (response?.message && !response?.error && !response?.status);
      if (ok) {
        const updatedUser = { ...user, ...variables };
        setUser(updatedUser);
        await fetchUser();
        const current = useUserStore.getState?.().user;
        if (current && !current.email && variables.email) {
          setUser({ ...current, email: variables.email });
        }
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
  });

  return {
    updateProfileMutation,
    updatePasswordMutation,
  };
}
