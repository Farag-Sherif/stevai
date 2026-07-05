import { useMutation } from "@tanstack/react-query";
import { sendContact } from "@/api/main";

export function useContactMutations() {
  const contactMutation = useMutation({
    mutationFn: sendContact,
  });

  return {
    contactMutation,
  };
}
