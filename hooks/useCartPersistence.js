"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { cartStorage } from "@/utils/cartStorage";
import { syncCartWithBackend, getCart, removeAllFromCart } from "@/api/cart";
import { useUserStore } from "@/store/userStore";
import { calcFinalPrice } from "@/utils/pricing";
import { getProductImageUrl } from "@/utils/productImage";

/** Apply site pricing logic (discount then VAT) so cart prices match product/checkout. */
function mapBackendItemToCartItem(item) {
  if (!item || typeof item !== "object") return item;
  const qty = Math.max(1, Number(item.quantity) ?? Number(item.pivot?.qty) ?? Number(item.qty) ?? 1);
  const pricing = calcFinalPrice({
    ...item,
    price: Number(item.price) ?? Number(item.unit_price) ?? 0,
    total: item.total != null ? Number(item.total) : undefined,
    discount: Number(item.discount) || 0,
    added_value: item.added_value ?? item.addedValuePercent ?? item.taxPercentage,
  });
  return {
    ...item,
    id: item.id ?? item.item_id,
    quantity: qty,
    price: pricing.finalPrice,
    oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
    discount: pricing.discountPercentage,
    originalBasePrice: pricing.afterDiscount,
    taxAmount: pricing.taxAmount,
    addedValuePercent: pricing.taxPercentage,
    name: item.name ?? item.title,
    title: item.title ?? item.name,
    image_path: getProductImageUrl(item),
    imgSrc: getProductImageUrl(item),
  };
}

export function useCartPersistence(cartProducts, setCartProducts) {
  const { user, isAuthenticated } = useUserStore();
  const [isClient, setIsClient] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const { items } = cartStorage.loadCart();
    if (items.length > 0 && cartProducts?.length === 0) {
      setCartProducts(items);
    }
    setHasInitialized(true);
  }, [isClient]);

  // Save cart to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (!isClient || !hasInitialized) return;

    // IMPORTANT:
    // Avoid overwriting a non-empty guest cart in localStorage with an empty in-memory cart
    // during the login transition (before syncCartOnLogin runs).
    const { items: storedItems, syncedUserId } = cartStorage.loadCart();
    const currentUserId = String(user?.id ?? user?.user_id ?? "");
    const hasStored = (storedItems?.length || 0) > 0;
    const isEmptyNow = (cartProducts?.length || 0) === 0;

    // Only block the "save empty cart" case if the stored cart belongs to guest
    // (i.e., wasn't synced for this user yet). Otherwise keep localStorage in sync.
    if (isAuthenticated && isEmptyNow && hasStored && String(syncedUserId || "") !== currentUserId) {
      return;
    }

    cartStorage.saveCart(cartProducts || []);
  }, [cartProducts, isClient, hasInitialized, isAuthenticated, user]);

  const syncInProgressRef = useRef(false);

  // Sync with backend when user logs in (single run per login, no duplicate requests)
  const syncCartOnLogin = useCallback(async () => {
    if (!isClient || !hasInitialized || !isAuthenticated || !user) return;
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;

    try {
      // Check both possible localStorage keys for cart items
      let localCartItems = [];

      const currentUserId = String(user?.id ?? user?.user_id ?? "");

      // Snapshot of new-key cart for "already synced" detection
      const {
        items: newKeyItems,
        timestamp: newKeyTimestamp,
        syncedUserId,
        syncedAt,
      } = cartStorage.loadCart();

      // Check the old cart key (legacy)
      const oldCart = localStorage.getItem("cart");
      let oldKeyItems = [];
      if (oldCart && oldCart !== "undefined" && oldCart !== "null") {
        try {
          const oldItems = JSON.parse(oldCart);
          if (Array.isArray(oldItems) && oldItems.length > 0) {
            localCartItems = [...localCartItems, ...oldItems];
            oldKeyItems = oldItems;
          }
        } catch (error) {
          console.error("Error parsing old cart:", error);
          // Clear corrupted data
          localStorage.removeItem("cart");
        }
      }

      // Check the new cart key (preferred)
      if (newKeyItems && newKeyItems.length > 0) {
        localCartItems = [...localCartItems, ...newKeyItems];
      }

      // If this local cart already belongs to the current user AND hasn't changed since last sync,
      // avoid re-syncing (prevents duplicate additions on subsequent logins).
      const alreadySyncedForUser =
        currentUserId && String(syncedUserId || "") === currentUserId;
      const syncedAtMs = syncedAt ? Number(syncedAt) : null;
      const localTsMs = newKeyTimestamp ? Number(newKeyTimestamp) : null;
      const hasLocalChangesAfterSync =
        alreadySyncedForUser && syncedAtMs && localTsMs
          ? localTsMs > syncedAtMs
          : false;

      if (alreadySyncedForUser && !hasLocalChangesAfterSync && (oldKeyItems?.length || 0) === 0) {
        try {
          const backendCart = await getCart();
          const items = (backendCart.items || []).map(mapBackendItemToCartItem);
          setCartProducts(items);
          cartStorage.saveCart(items);
        } catch (error) {
          console.error("Failed to load backend cart:", error);
        }
        return;
      }

      // Remove duplicates based on id
      const uniqueItems = localCartItems.filter(
        (item, index, self) => index === self.findIndex((i) => i.id === item.id)
      );

      if (uniqueItems.length === 0) {
        try {
          const backendCart = await getCart();
          const items = (backendCart.items || []).map(mapBackendItemToCartItem);
          setCartProducts(items);

          // Mirror backend cart to localStorage so remove/update stays consistent
          cartStorage.saveCart(items);
          const userId = user?.id ?? user?.user_id;
          if (userId) cartStorage.markSyncedForUser(userId);
        } catch (error) {
          console.error("Failed to load backend cart:", error);
        }
        return;
      }

      // تفريغ سلة الباك إند أولاً حتى تعكس سلة المستخدم سلة الزائر (بما فيها الحذف)
      try {
        await removeAllFromCart();
      } catch (e) {
        console.warn("removeAllFromCart before sync:", e);
      }

      const syncResult = await syncCartWithBackend(uniqueItems);

      if (syncResult && syncResult.success) {
        const backendItems = (syncResult.cart?.items || []).map(
          mapBackendItemToCartItem
        );
        setCartProducts(backendItems);

        localStorage.removeItem("cart"); // legacy key
        cartStorage.saveCart(backendItems);

        // Mark as synced AFTER saveCart so syncedAt is always >= timestamp
        const userId = user?.id ?? user?.user_id;
        if (userId) cartStorage.markSyncedForUser(userId);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("Cart sync failed, keeping local cart");
        }
        // Local items already have our app's final price; only ensure numeric fields
        const normalized = uniqueItems.map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
          oldPrice: it.oldPrice != null ? Number(it.oldPrice) : null,
        }));
        setCartProducts(normalized);
        cartStorage.saveCart(normalized);
      }
    } catch (error) {
      console.error("Error during automatic cart sync:", error);
      try {
        const backendCart = await getCart();
        const items = (backendCart.items || []).map(mapBackendItemToCartItem);
        setCartProducts(items);
      } catch (backendError) {
        console.error(
          "Failed to load backend cart after sync error:",
          backendError
        );
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isClient, hasInitialized, isAuthenticated, user, setCartProducts]);

  // Handle logout - clear cart or keep based on preference
  const handleLogout = useCallback(() => {
    if (!isClient) return;
    // Option 1: Clear cart on logout
    // cartStorage.clearCart();
    // setCartProducts([]);
    // Option 2: Keep cart in localStorage for guest shopping
    // (current implementation keeps the cart)
  }, [isClient]);

  return {
    syncCartOnLogin,
    handleLogout,
    loadLocalCart: () =>
      isClient ? cartStorage.loadCart() : { items: [], timestamp: null },
    clearLocalCart: () => (isClient ? cartStorage.clearCart() : null),
    isReady: isClient && hasInitialized,
  };
}
