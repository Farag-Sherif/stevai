import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useNewsletterMutations() {
  const subscribeMutation = useMutation({
    mutationFn: async (email) => {
      const response = await axios.post(
        "https://express-brevomail.vercel.app/api/contacts",
        { email }
      );
      if (![200, 201].includes(response.status)) {
        throw new Error("Failed to subscribe");
      }
      return response.data;
    },
  });

  return {
    subscribeMutation,
  };
}
