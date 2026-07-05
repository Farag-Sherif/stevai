"use client";

import { create } from "zustand";
import { getUser } from "@/api/auth";

function extractUserPayload(response) {
  if (!response) return null;
  if (
    response?.status === "error" ||
    response?.message === "Unauthenticated." ||
    response?.error === "Unauthenticated."
  ) {
    return null;
  }
  let payload = null;
  if (response?.data && typeof response.data === "object") payload = response.data;
  else if (response?.user && typeof response.user === "object") payload = response.user;
  else if (typeof response === "object") payload = response;
  if (!payload) return null;
  const id = payload?.id;
  if (id === 0 || id === "0") return null;
  return payload;
}

function isValidUser(user) {
  if (!user) return false;
  const id = user?.id;
  if (id === 0 || id === "0") return false;
  return (
    (typeof id === "number" && Number.isFinite(id) && id > 0) ||
    (typeof id === "string" && String(id).trim().length > 0)
  );
}

const USER_EMAIL_STORAGE_KEY = "stevia_user_email";

function emailKey(userId) {
  return userId != null ? `${USER_EMAIL_STORAGE_KEY}_${String(userId)}` : null;
}

function getStoredEmail(userId) {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key) return null;
  try {
    return localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

function setStoredEmail(userId, email) {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key || !email) return;
  try {
    localStorage.setItem(key, email);
  } catch {
    // ignore
  }
}

function clearStoredEmail(userId) {
  const key = emailKey(userId);
  if (typeof window === "undefined" || !key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUser();
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
    } catch (error) {
      const msg = String(error?.message ?? "");
      const isAuthFailure = msg.includes("401") || msg.includes("Unauthenticated");
      if (isAuthFailure) {
        set({ user: null, isAuthenticated: false, error: null, isLoading: false });
        return;
      }
      console.error("Failed to fetch user:", error);
      set({ user: null, isAuthenticated: false, error: "Failed to fetch user", isLoading: false });
    }
  },

  setUser: (userData) => {
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

export { useUserStore };

