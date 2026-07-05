const CART_STORAGE_KEY = "ecommerce_cart";
const CART_TIMESTAMP_KEY = "ecommerce_cart_timestamp";
const CART_SYNCED_USER_KEY = "ecommerce_cart_synced_user_id";
const CART_SYNCED_AT_KEY = "ecommerce_cart_synced_at";

/** Remove invalid/broken cart items (Unknown Product, missing id, or 0 price with no name). Export for use elsewhere. */
export const filterInvalidCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const name = (item?.name || item?.title || "").trim();
    const price = Number(item?.price) || 0;
    const hasId = item?.id != null && item?.id !== "";
    const isInvalid =
      !hasId ||
      (price === 0 && (name === "Unknown Product" || !name));
    return !isInvalid;
  });
};

const filterInvalidItems = filterInvalidCartItems;

export const cartStorage = {
  // Save cart to localStorage (filters invalid items)
  saveCart: (cartItems) => {
    try {
      const filtered = filterInvalidItems(cartItems || []);
      const cartData = {
        items: filtered,
        timestamp: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      localStorage.setItem(CART_TIMESTAMP_KEY, cartData.timestamp.toString());
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  },

  // Load cart from localStorage
  loadCart: () => {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData || cartData === "undefined" || cartData === "null") {
        return { items: [], timestamp: null, syncedUserId: null, syncedAt: null };
      }

      const parsed = JSON.parse(cartData);
      return {
        items: filterInvalidItems(parsed.items || []),
        timestamp: parsed.timestamp || null,
        syncedUserId: localStorage.getItem(CART_SYNCED_USER_KEY),
        syncedAt: localStorage.getItem(CART_SYNCED_AT_KEY),
      };
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
      localStorage.removeItem(CART_SYNCED_USER_KEY);
      localStorage.removeItem(CART_SYNCED_AT_KEY);
      return { items: [], timestamp: null, syncedUserId: null, syncedAt: null };
    }
  },

  // Mark current local cart as already synced to backend for a specific user.
  markSyncedForUser: (userId) => {
    try {
      if (!userId) return;
      localStorage.setItem(CART_SYNCED_USER_KEY, String(userId));
      localStorage.setItem(CART_SYNCED_AT_KEY, String(Date.now()));
    } catch (error) {
      console.error("Failed to mark cart as synced:", error);
    }
  },

  // Clear cart from localStorage
  clearCart: () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
      localStorage.removeItem(CART_SYNCED_USER_KEY);
      localStorage.removeItem(CART_SYNCED_AT_KEY);
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  },

  // Check if localStorage cart is newer than backend cart
  isLocalCartNewer: (backendTimestamp) => {
    const localTimestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
    if (!localTimestamp || !backendTimestamp) return !!localTimestamp;

    return parseInt(localTimestamp) > new Date(backendTimestamp).getTime();
  },

  /**
   * Merge local cart items with backend cart items.
   * Now uses cartId as the unique key to allow duplicate products.
   * @param {Array} localCart - Cart items from localStorage
   * @param {Array} backendCart - Cart items from API
   * @returns {Array} Merged cart items
   */
  mergeCarts: (localCart, backendCart) => {
    const mergedMap = new Map();

    // Add backend items first (these might not have cartId yet)
    backendCart.forEach((item) => {
      // Generate cartId if it doesn't exist
      const key = item.cartId || `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      mergedMap.set(key, { ...item, cartId: key });
    });

    // Add local items (these should have cartId from addProductToCart)
    localCart.forEach((localItem) => {
      // Generate cartId if it doesn't exist (for backwards compatibility)
      const key = localItem.cartId || `${localItem.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Always add local items as separate entries (don't merge duplicates)
      mergedMap.set(key, { ...localItem, cartId: key });
    });

    return Array.from(mergedMap.values());
  },
};
