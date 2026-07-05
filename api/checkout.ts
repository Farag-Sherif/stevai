import {
  clearAuthToken,
  get,
  post,
  postFormData,
  setAuthToken,
} from "@/server/api";



export async function checkOuCallback(id) {
    const formData = new FormData();
    formData.append("orderId", id);
    
    const response = await postFormData(`/payment/callback`, formData);
    if (process.env.NODE_ENV !== "production") {
        console.log(response);
    }
    return response;
  }