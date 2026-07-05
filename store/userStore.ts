import { create } from "zustand";
import { getUser } from "@/api/auth";

interface Order {
  id?: string | number;
  date?: string;
  created_at?: string;
  status?: string;
  total?: number;
  price?: number;
  item_count?: number;
  phone?: string;
  email?: string;
  street?: string;
  country?: string;
}

interface Address {
  id?: string | number;
  f_name?: string;
  l_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  home_phone?: string;
  [key: string]: any;
}

interface User {
  id?: string | number;
  fname?: string;
  lname?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  orders?: Order[];
  addresses?: Address[];
  [key: string]: any;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (userData: any) => void;
  clearUser: () => void;
  addAddressToUser: (address: Record<string, any>) => void;
  updateAddressInUser: (addressId: string | number, updates: Record<string, any>) => void;
  removeAddressFromUser: (addressId: string | number) => void;
}

function extractUserPayload(response: any): User | null {
  if (!response) return null;
  if (
    response?.status === "error" ||
    response?.message === "Unauthenticated." ||
    response?.error === "Unauthenticated."
  ) {
    return null;
  }
  let payload: User | null = null;
  if (response?.data && typeof response.data === "object") payload = response.data as User;
  else if (response?.user && typeof response.user === "object") payload = response.user as User;
  else if (typeof response === "object") payload = response as User;
  if (!payload) return null;
  const id = payload?.id;
  if (id === 0 || id === "0") return null;
  return payload;
}

function isValidUser(user: any): user is User {
  const id = user?.id;
  // Reject dummy/guest/placeholder IDs so site opens in normal guest state
  if (id === 0 || id === "0") return false;
  return (
    (typeof id === "number" && Number.isFinite(id) && id > 0) ||
    (typeof id === "string" && String(id).trim().length > 0)
  );
}

const USER_EMAIL_STORAGE_KEY = "stevia_user_email";

function emailKey(userId: string | number | undefined): string | null {
  return userId != null ? `${USER_EMAIL_STORAGE_KEY}_${String(userId)}` : null;
}

function getStoredEmail(userId: string | number | undefined): string | null {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key) return null;
  try {
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

function setStoredEmail(userId: string | number | undefined, email: string) {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key || !email) return;
  try {
    localStorage.setItem(key, email);
  } catch {
    // ignore
  }
}

function clearStoredEmail(userId: string | number | undefined) {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await getUser();
      const userPayload = extractUserPayload(response);
      if (isValidUser(userPayload)) {
        const id = userPayload.id;
        const storedEmail = getStoredEmail(id);
        const userWithEmail = storedEmail && !userPayload.email
          ? { ...userPayload, email: storedEmail }
          : userPayload;
        if (userPayload.email) setStoredEmail(id, userPayload.email);
        set({ user: userWithEmail, isAuthenticated: true, isLoading: false });
        return;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      const msg = String(error?.message ?? "");
      const isAuthFailure = msg.includes("401") || msg.includes("Unauthenticated");
      if (isAuthFailure) {
        set({ user: null, isAuthenticated: false, error: null, isLoading: false });
        return;
      }
      console.error("Error fetching user:", error);
      set({ user: null, isAuthenticated: false, error: "Failed to fetch user", isLoading: false });
    }
  },

  setUser: (userData: any) => {
    const payload = extractUserPayload(userData);
    if (isValidUser(payload) && payload.email) {
      setStoredEmail(payload.id, payload.email);
    }
    set({
      user: isValidUser(payload) ? payload : null,
      isAuthenticated: isValidUser(payload),
    });
  },

  clearUser: () => {
    const userId = get().user?.id;
    clearStoredEmail(userId);
    set({ user: null, isAuthenticated: false });
  },

  addAddressToUser: (address) => {
    set((state) => {
      if (!state.user) return state;
      const newAddr = {
        id: address.id ?? `temp-${Date.now()}`,
        f_name: address.f_name ?? address.firstName,
        l_name: address.l_name ?? address.lastName,
        email: address.email,
        phone: address.phone,
        city: address.city,
        state: address.state ?? "",
        home_phone: address.home_phone ?? "",
      };
      const addresses = [...(state.user.addresses || []), newAddr];
      return { user: { ...state.user, addresses } };
    });
  },

  updateAddressInUser: (addressId, updates) => {
    set((state) => {
      if (!state.user?.addresses) return state;
      const addresses = state.user.addresses.map((addr) =>
        String(addr.id) === String(addressId) ? { ...addr, ...updates } : addr
      );
      return { user: { ...state.user, addresses } };
    });
  },

  removeAddressFromUser: (addressId) => {
    set((state) => {
      if (!state.user?.addresses) return state;
      const addresses = state.user.addresses.filter(
        (addr) => String(addr.id) !== String(addressId)
      );
      return { user: { ...state.user, addresses } };
    });
  },
}));
