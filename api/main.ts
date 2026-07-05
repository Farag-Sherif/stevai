import { get, postFormData } from "@/server/api";

export async function getTestimonials() {
  const response = await get("/testimonials");
  return response;
}

export async function getSocialLinks() {
  const response = await get("/socails");
  return response;
}

export async function getAddress() {
  const response = await get("/addresse");
  return response;
}

export async function getEmail() {
  const response = await get("/emails");
  return response;
}

export async function getPhone() {
  const response = await get("/mobiles");
  return response;
}

export async function getImages() {
  const response = await get("/images");
  return response;
}

export async function getCities() {
  try {
    const response = await get("/cities");
    if (response && typeof response === "object" && "error" in response) return [];
    return Array.isArray(response) ? response : [];
  } catch {
    return [];
  }
}

export async function getOrders() {
  const response = await get("/orders");
  return response;
}

export async function getOrderById(orderId: string | number) {
  try {
    const response = await get(`/orders/${orderId}`);
    if (response && typeof response === "object" && "error" in response) return null;
    return (response as any)?.data ?? (response as any)?.order ?? response;
  } catch {
    return null;
  }
}

export async function getChoices() {
  try {
    const response = await get("/choices");
    if (response && typeof response === "object" && "error" in response) return [];
    return Array.isArray(response) ? response : [];
  } catch {
    return [];
  }
}

export async function getSettings() {
  const response = await get("/settings");
  return response;
}

export async function sendContact(data: any) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("subject", data.subject);
  formData.append("message", data.message);
  const response = await postFormData("/contact", formData);
  return response;
}

export async function getQuestions() {
  const response = await get("/questions");
  return response;
}

export async function getTermsAndConditions() {
  const response = await get("/conditions");
  return response;
}
