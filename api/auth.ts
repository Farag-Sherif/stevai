import {
  clearAuthToken,
  get,
  post,
  postFormData,
  setAuthToken,
} from "@/server/api";
import { removeAllFromCart } from "@/api/cart";

export async function register(formData: FormData) {
  const response = (await postFormData("/register", formData)) as {
    status: "success" | "error";
    token?: string;
    message?: string;
    error?: Record<string, string | string[]> | string;
    errors?: Record<string, string | string[]>;
  };

        if (process.env.NODE_ENV !== "production") {
            console.log("register response", response);
        }

  if (response.status === "success" && response.token) {
    await setAuthToken(response.token);
  }
  return response;
}

export async function login(formData: FormData) {
  const response = (await postFormData("/login", formData)) as {
    status: string;
    token: string;
  };

  if (response.status === "success" && response.token) {
    await setAuthToken(response.token);
  }

  await getUser();

  return response;
}

/**
 * Login AND sync guest cart to backend in a single server-side call.
 * Keeps items added from localStorage (guest mode) when switching to user mode.
 * `cartItems` should be an array of { id, quantity, weight } objects from localStorage.
 */
export async function loginAndSyncCart(
  formData: FormData,
  cartItems: { id: number; quantity: number; weight: string }[]
) {
  const loginRes = (await postFormData("/login", formData)) as {
    status: string;
    token: string;
  };

  if (loginRes.status !== "success" || !loginRes.token) {
    return { login: loginRes, cartSync: null, userId: null, user: null };
  }

  await setAuthToken(loginRes.token);

  let cartSync = { success: true, synced: 0, failed: 0 };
  // Clear backend cart first so guest's cart (with removals) becomes the user's cart exactly
  try {
    await removeAllFromCart();
  } catch (e) {
    console.warn("Could not clear backend cart before sync:", e);
  }
  if (cartItems && cartItems.length > 0) {
    const results = await Promise.allSettled(
      cartItems.map(async (item) => {
        const itemId = Number(item.id);
        const qty = Number(item.quantity) || 1;
        const weight = String(item.weight || "");
        if (!itemId || !Number.isFinite(itemId)) return;

        const fd = new FormData();
        fd.append("item_id", String(itemId));
        fd.append("qty", String(qty));
        fd.append("weight", weight);
        return await postFormData("/add-to-cart", fd);
      })
    );

    const failed = results.filter((r) => {
      if (r.status === "rejected") return true;
      const v: any = r.value;
      return v?.status === "error" || v?.error || v?.message === "Unauthenticated.";
    }).length;
    cartSync = { success: failed === 0, synced: results.length - failed, failed };
  }

  const userResponse = await getUser();
  const userPayload =
    (userResponse as any)?.data ?? (userResponse as any)?.user ?? userResponse;
  const userId = userPayload?.id ?? null;

  return { login: loginRes, cartSync, userId, user: userPayload };
}

export async function logout() {
  const response = await post("/logout", {});
  await clearAuthToken();
  return response;
}

export async function getUser() {
  const response = (await get("/user", { cache: "no-store" })) as any;
  return response;
}

export async function updateUser({ fname, lname, phone }) {
  const formData = new FormData();
  formData.append("fname", fname);
  formData.append("lname", lname);
  formData.append("phone", phone);

  const response = await postFormData("/user/edit_profile", formData);
  return response;
}

export async function updateUserPassword({ password }) {
  const formData = new FormData();
  formData.append("password", password);
  const response = await postFormData("/user/password", formData);
  return response;
}

export async function forgotPassword(formData: FormData) {
  // Sends the reset code to the provided email address
  // Endpoint: POST /api/password/email
  // Body: form-data with email field
  const response = (await postFormData("/password/email", formData)) as {
    status?: "success" | "error";
    message?: string;
    error?: string | Record<string, string | string[]>;
    errors?: Record<string, string | string[]>;
  };
  return response;
}

export async function resetPassword(formData: FormData) {
  const response = await postFormData("/password/reset", formData);
  return response;
}

export async function createAddress({
  f_name,
  l_name,
  email,
  phone,
  city,
  state,
  home_phone,
}) {
  const formData = new FormData();
  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("city", city);
  if (state !== undefined && state !== null && state !== "") {
    formData.append("state", state);
  }
  if (home_phone !== undefined && home_phone !== null && home_phone !== "") {
    formData.append("home_phone", home_phone);
  }

  const response = await postFormData("/user/addresses/add", formData);

  return response;
}

export async function getAddresses() {
  const response = await get("/user/addresses");
  return response;
}

export async function editAddress({
  id,
  f_name,
  l_name,
  email,
  phone,
  city,
  state,
  home_phone,
}) {
  const formData = new FormData();
  formData.append("f_name", f_name);
  formData.append("l_name", l_name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("city", city);
  if (state !== undefined && state !== null && state !== "") {
    formData.append("state", state);
  }
  if (home_phone !== undefined && home_phone !== null && home_phone !== "") {
    formData.append("home_phone", home_phone);
  }
  const response = await postFormData(`/user/addresses/edit/${id}`, formData);
  return response;
}

export async function deleteAddress(addressId: number | string) {
  const formData = new FormData();
  const response = await postFormData(`/user/addresses/delete/${addressId}`, formData);
  if ((response as any)?.status === "error" || (response as any)?.error) {
    throw new Error(JSON.stringify(response));
  }
  return response;
}
