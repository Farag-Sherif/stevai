import { get, post, postFormData } from "@/server/api";

// Normalize weight strings like "250 g", "200gm" -> "250", "200"
const normalizeWeight = (weight: unknown): string => {
  if (weight === null || weight === undefined) return "";
  const s = String(weight).trim();
  if (!s) return "";
  const m = s.match(/[0-9]+(?:\.[0-9]+)?/);
  return m ? m[0] : s;
};

export async function getCart() {
  return await get("/cart");
}

export async function addToCart(
  productId: number,
  qty: number,
  weight: string = ""
) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  formData.append("qty", qty.toString());

  const w = normalizeWeight(weight);
  if (w) formData.append("weight", w);

  const response = await postFormData("/add-to-cart", formData);
  return response;
}

export async function updateCartQuantity(productId: number, qty: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  formData.append("qty", qty.toString());

  const response = await postFormData("/update-qty-cart", formData);
  return response;
}

export async function removeFromCart(productId: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());

  const response = await postFormData("/remove-from-cart", formData);
  return response;
}

export async function removeAllFromCart() {
  const response = await post("/remove-all-from-cart", {});
  return response;
}

export async function syncCartWithBackend(localCartItems = []) {
  // Normalize and validate cart items
  const normalizedItems = localCartItems
    .map((item) => ({
      id: item.id,
      quantity: item.quantity || 1,
      weight: normalizeWeight(item.weight || ""),
      size_id: item.size_id || null,
      color: item.color || null,
    }))
    .filter((item) => item.id && item.quantity > 0);

  // Add each item to backend cart
  for (const item of normalizedItems) {
    await addToCart(item.id, item.quantity, item.weight);
  }

  // Fetch updated cart from backend
  return await getCart();
}

export async function bulkAddToCart(cartItems = []) {
  // Normalize and validate cart items
  const normalizedItems = cartItems
    .map((item) => ({
      id: item.id || item.item_id,
      quantity: item.quantity || item.qty || 1,
      weight: normalizeWeight(item.weight || ""),
      size_id: item.size_id || null,
      color: item.color || null,
    }))
    .filter((item) => item.id && item.quantity > 0);

  // Add each item to backend cart
  for (const item of normalizedItems) {
    await addToCart(item.id, item.quantity, item.weight);
  }

  // Fetch updated cart from backend
  return await getCart();
}

// Checkout for authenticated users
export async function checkout({
  address_id,
  notes,
  type = "cod",
  session_id,
  amount,
}: {
  address_id: number;
  notes?: string;
  type?: string;
  session_id?: string;
  // Optional: pass a rounded amount (e.g. "771.78") to avoid gateway float tails.
  amount?: string | number;
}) {
  const formData = new FormData();
  formData.append("address_id", address_id.toString());
  if (notes) formData.append("notes", notes);
  if (type) formData.append("type", type);
  if (session_id) formData.append("session_id", session_id);
  // Backend MUST use this amount when creating Geidea/gateway session so "Pay X EGP" matches checkout total.
  if (amount !== undefined && amount !== null && String(amount).trim() !== "") {
    formData.append("amount", String(amount));
  }

  const response = await postFormData("/checkout", formData);
  return response;
}

// Checkout for guest users (uses same /checkout endpoint as auth - backend detects guest by params)
export async function checkoutWithOutAuth({
  f_name,
  l_name,
  email,
  phone,
  city,
  state,
  zip,
  notes,
  cart,
  type = "cod",
  session_id,
  amount,
  // Optional legacy fields (backend may ignore)
  address,
  payment,
}: {
  f_name: string;
  l_name: string;
  email?: string;
  phone: string;
  city: string;
  state?: string;
  zip?: string;
  notes?: string;
  cart: Array<{
    item_id: number;
    qty: number;
    size_id?: number;
    weight?: string | number;
    color?: string;
  }>;
  type?: string; // "cod" | "gate"
  session_id?: string;
  amount?: string | number;
  address?: string;
  payment?: string;
}) {
  const formData = new FormData();
  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  if (email) formData.append("email", email);
  if (state) formData.append("state", state);
  if (zip) formData.append("zip", zip);
  formData.append("city", city);
  formData.append("phone", phone);
  if (notes) formData.append("notes", notes);
  if (type) formData.append("type", type);
  if (session_id) formData.append("session_id", session_id);
  if (address) formData.append("address", address);
  if (payment) formData.append("payment", payment);
  // Backend MUST use this amount when creating Geidea/gateway session so "Pay X EGP" matches checkout total.
  if (amount !== undefined && amount !== null && String(amount).trim() !== "") {
    formData.append("amount", String(amount));
  }

  // Cart items
  cart.forEach((item, index) => {
    formData.append(`cart[${index}][item_id]`, item.item_id.toString());
    formData.append(`cart[${index}][qty]`, item.qty.toString());
    if (item.size_id !== undefined && item.size_id !== null) {
      formData.append(`cart[${index}][size_id]`, item.size_id.toString());
    }
    if (item.weight !== undefined && item.weight !== null && String(item.weight).trim() !== "") {
      formData.append(`cart[${index}][weight]`, normalizeWeight(item.weight));
    }
    if (item.color !== undefined && item.color !== null && String(item.color).trim() !== "") {
      formData.append(`cart[${index}][color]`, String(item.color));
    }
  });

  // Backend uses /checkout for both guest and auth (detects by params)
  const response = await postFormData("/checkout", formData);
  return response;
}


export async function getWishlistItems() {
  const response = await get("/wishlist");
  return response;
}

export async function addWishlist(item_id: number) {
  const response = await post(`/wishlist/add?item_id=${item_id}`, {});
  return response;
}

export async function removeWishlist(item_id: number) {
  const response = await post(`/wishlist/remove?item_id=${item_id}`, {});
  return response;
}
