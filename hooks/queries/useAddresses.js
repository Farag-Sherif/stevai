import { useQuery } from "@tanstack/react-query";
import { getAddresses } from "@/api/auth";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export function useAddresses() {
  const { user, setUser } = useUserStore();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getAddresses(),
    enabled: !!userId && (!user?.addresses || user.addresses.length === 0),
    staleTime: 5 * 60 * 1000,
  });

  // Sync with global store if needed, though ideally we should rely entirely on the query cache.
  // For now, to prevent breaking other parts of the app that rely on user.addresses, we sync it.
  useEffect(() => {
    if (query.data) {
      const list = Array.isArray(query.data) ? query.data : query.data?.data ?? query.data?.addresses ?? [];
      if (list.length > 0 && (!user?.addresses || user.addresses.length === 0)) {
        setUser({ ...user, addresses: list });
      }
    }
  }, [query.data, user, setUser]);

  return {
    ...query,
    addresses: user?.addresses || [],
  };
}
