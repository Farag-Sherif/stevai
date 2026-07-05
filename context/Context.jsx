"use client";
import { openCartModal } from "@/utlis/openCartModal";
import { openWistlistModal } from "@/utlis/openWishlist";
import { useCartPersistence } from "@/hooks/useCartPersistence";
import { cartStorage, filterInvalidCartItems } from "@/utils/cartStorage";
import { useUserStore } from "@/store/userStore";
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity,
} from "@/api/cart";
import { updateFavorites, getFavorites, getProduct } from "@/api/products";
import { calcFinalPrice } from "@/utils/pricing";
import { getProductImageUrl } from "@/utils/productImage";
import { getOutOfStockText, isProductInStock } from "@/utils/productStock";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usePathname } from "@/router/navigation";
import { useCartMutations } from "@/hooks/mutations/useCartMutations";
import { useWishlistMutations } from "@/hooks/mutations/useWishlistMutations";

import React, { useEffect, useRef } from "react";
import { useContext, useState, useCallback } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const pathname = usePathname();
  const isArabic = typeof pathname === "string" && pathname.startsWith("/ar");
  const queryClient = useQueryClient();
  const [cartProductsState, setCartProductsState] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [wishlistActionIds, setWishlistActionIds] = useState([]);
  
  const { addToCartMutation, removeFromCartMutation, updateCartQuantityMutation } = useCartMutations();
  const { toggleWishlistMutation } = useWishlistMutations();

  // Wrapper to ensure cartProducts is always an array
  // Wrapper to ensure cartProducts is always an array
  const setCartProducts = useCallback((value) => {
    if (typeof value === "function") {
      setCartProductsState((prev) => {
        const newValue = value(Array.isArray(prev) ? prev : []);
        return Array.isArray(newValue) ? newValue : [];
      });
    } else {
      setCartProductsState(Array.isArray(value) ? value : []);
    }
  }, []);

  // Ensure cartProducts is always an array
  const cartProducts = Array.isArray(cartProductsState)
    ? cartProductsState
    : [];

  const { user, isAuthenticated, fetchUser } = useUserStore();
  const { syncCartOnLogin, handleLogout, isReady } = useCartPersistence(
    cartProducts,
    setCartProducts
  );

  const lastCartSyncedUserIdRef = useRef(null);
  const lastWishlistSyncedUserIdRef = useRef(null);
  const loadCartDataInProgressRef = useRef(false);

  // Initialize user on app load (once)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Helper function to normalize cart product data
  const normalizeCartProduct = (product) => {
    const price = Number(product?.price) || 0;
    const qty = Number(product?.quantity) || 1;

    const parsedOldPrice =
      typeof product?.oldPrice !== "undefined" && product?.oldPrice !== null
        ? Number(product.oldPrice)
        : null;
    const oldPrice = Number.isFinite(parsedOldPrice) ? parsedOldPrice : product?.oldPrice ?? null;

    // Discount: prefer explicit discount, otherwise infer from oldPrice vs price when possible
    let discount = 0;
    if (typeof product?.discount !== "undefined" && product?.discount !== null && product?.discount !== "") {
      const d = Number(product.discount);
      discount = Number.isFinite(d) ? d : 0;
    } else if (typeof oldPrice === "number" && oldPrice > 0 && price > 0 && oldPrice > price) {
      discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    // Added value (VAT) percentage: support multiple field names
    const addedValuePercent =
      typeof product?.addedValuePercent !== "undefined"
        ? Number(product.addedValuePercent) || 0
        : typeof product?.added_value !== "undefined"
          ? Number(product.added_value) || 0
          : typeof product?.taxPercentage !== "undefined"
            ? Number(product.taxPercentage) || 0
            : 0;

    // Base after discount, before tax (used for VAT breakdown)
    const originalBasePrice =
      typeof product?.originalBasePrice === "number" && !Number.isNaN(product.originalBasePrice)
        ? product.originalBasePrice
        : typeof product?.originalPrice === "number" && !Number.isNaN(product.originalPrice)
          ? product.originalPrice
          : undefined;

    // Optional per-unit tax amount (preferred by checkout if present)
    const taxAmount =
      typeof product?.taxAmount === "number" && !Number.isNaN(product.taxAmount)
        ? product.taxAmount
        : undefined;

    // للسلة والـ checkout (خاصة الزائر): حفظ السعر الأساسي لاستخدامه في الحساب (سعر → + ضريبة → - خصم)
    const basePrice = product.basePrice ?? product.originalBasePrice ?? product.originalPrice ?? (originalBasePrice != null ? originalBasePrice : undefined);

    return {
      id: product.id,
      name: product.name || product.title || "Unknown Product",
      title: product.title || product.name || "Unknown Product",
      image_path: getProductImageUrl(product),
      imgSrc: getProductImageUrl(product),
      price,
      oldPrice,
      quantity: qty,
      weight: product.weight,
      cartId: product.cartId || `${product.id}`,
      discount,
      addedValuePercent,
      originalBasePrice: originalBasePrice ?? basePrice,
      basePrice,
      taxAmount,
      category: product.category,
    };
  };


// Build a complete cart item (with VAT/discount breakdown) by fetching product details from API
const buildCartItemFromApi = async (productId, qty = 1) => {
  try {
    const idNum = Number(productId);
    if (!idNum) return null;

    const resp = await getProduct(idNum);
    const p = resp?.item ?? resp?.data ?? resp;
    if (!p) return null;

    const pricing = calcFinalPrice({
      ...p,
      price: Number(p?.price) || 0,
      discount: Number(p?.discount) || 0,
      added_value: p?.added_value,
      total: p?.total,
    });

    return {
      id: p.id,
      name: p.name || p.title || "Unknown Product",
      title: p.title || p.name || "Unknown Product",
      image_path: getProductImageUrl(p),
      imgSrc: getProductImageUrl(p),
      is_available: p.is_available,
      inStock: p.inStock,
      price: pricing.finalPrice,
      oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
      originalPrice: Number(p.price) || 0,
      basePrice: Number(p.price) || 0,
      discount: Number(p.discount) || 0,
      added_value: Number(p.added_value ?? p.addedValuePercent) || 0,
      originalBasePrice: pricing.afterDiscount,
      taxAmount:
        typeof pricing.taxAmount === "number" && !Number.isNaN(pricing.taxAmount)
          ? pricing.taxAmount
          : undefined,
      category: p.category,
      weight: p.weight || "",
      quantity: qty,
    };
  } catch (e) {
    console.error("Failed to build cart item from API:", e);
    return null;
  }
};


  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      const price = Number(product?.price) || 0;
      const qty = Math.max(0, Number(product?.quantity) || 1);
      return accumulator + qty * price;
    }, 0);
    setTotalPrice(Number.isFinite(subtotal) ? subtotal : 0);
  }, [cartProductsState]);

  // Load cart: once per user (no loop). Guest: load from storage. Auth: sync cart once per user id.
  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated || !user) {
      lastCartSyncedUserIdRef.current = null;
      if (loadCartDataInProgressRef.current) return;
      loadCartData();
      return;
    }

    const userId = user.id ?? user.user_id;
    if (lastCartSyncedUserIdRef.current === userId) return;
    lastCartSyncedUserIdRef.current = userId;
    syncCartOnLogin();
  }, [isAuthenticated, user, syncCartOnLogin, isReady]);

  // Sync Wishlist once per user (no repeated requests when user ref changes)
  useEffect(() => {
    if (!user) {
      lastWishlistSyncedUserIdRef.current = null;
      // On logout: restore wishlist from localStorage for guest view
      if (typeof window !== "undefined") {
        try {
          const raw = JSON.parse(localStorage.getItem("wishlist") || "[]");
          const items = Array.isArray(raw) ? raw : [];
          const normalized = items.map((x) => Number(x) || x);
          setWishList(normalized);
        } catch (_) {}
      }
      return;
    }
    const userId = user.id ?? user.user_id;
    if (lastWishlistSyncedUserIdRef.current === userId) return;
    lastWishlistSyncedUserIdRef.current = userId;

    const syncAndFetchWishlist = async () => {
      try {
        const favsResponse = await getFavorites();
        const backendFavs = Array.isArray(favsResponse)
          ? favsResponse
          : favsResponse?.data ?? [];
        const backendIds = backendFavs.map((f) => String(f.item_id ?? f.item?.id ?? f.id ?? "")).filter(Boolean);

        const localItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const localIds = (Array.isArray(localItems) ? localItems : []).map(String);

        if (localIds.length > 0) {
          const toSync = localIds.filter((lid) => !backendIds.some((bid) => bid === lid));
          for (const id of toSync) {
            try {
              await toggleWishlistMutation.mutateAsync(Number(id) || id);
            } catch (_) {}
          }
        }

        const updatedRes = await getFavorites();
        const updatedFavs = Array.isArray(updatedRes) ? updatedRes : updatedRes?.data ?? [];
        const finalIds = updatedFavs
          .map((f) => f.item_id ?? f.item?.id ?? f.id)
          .filter((v) => v != null && v !== "")
          .map((v) => Number(v) || v);
        setWishList(Array.from(new Set(finalIds)));
      } catch (e) {
        console.error("Failed to sync wishlist:", e);
      }
    };

    syncAndFetchWishlist();
  }, [user]);

  const loadCartData = async () => {
    if (loadCartDataInProgressRef.current) return;
    loadCartDataInProgressRef.current = true;
    try {
      setIsCartLoading(true);

      // ✅ Guest: load from local storage (normalize to ensure VAT/discount fields exist)
if (!user) {
  const { items } = cartStorage.loadCart();
  const rawItems = Array.isArray(items) ? items : [];

  // If old/legacy items are missing VAT fields (common across domains like localhost vs vercel),
  // enrich them from API so checkout VAT breakdown is consistent everywhere.
  const enrichedItems = await Promise.all(
    rawItems.map(async (it) => {
      const hasVat =
        Number(
          it?.addedValuePercent ??
            it?.added_value ??
            it?.taxPercentage ??
            it?.addedValue
        ) > 0 || typeof it?.taxAmount === "number";

      if (hasVat) return it;

      const fetched = await buildCartItemFromApi(it?.id, it?.quantity || 1);
      if (!fetched) return it;

      return {
        ...fetched,
        quantity: Number(it?.quantity) || fetched.quantity || 1,
        cartId: it?.cartId || fetched.cartId,
      };
    })
  );

  const normalizedItems = enrichedItems.map((item) =>
    normalizeCartProduct(item)
  );
  const filtered = filterInvalidCartItems(normalizedItems);

  setCartProducts(filtered);

  // Persist enriched cart back to storage to avoid re-fetching on next reload
  cartStorage.saveCart(filtered);

  return;
}

      // ✅ Auth: load from backend; use same pricing logic as site (discount then VAT, support API total)
      const cartData = await getCart();
      const items = cartData?.items || [];
      const normalizedItems = Array.isArray(items)
        ? items.map((item) => {
            const qty = Number(item?.pivot?.qty ?? item?.quantity ?? 1) || 1;
            const pricing = calcFinalPrice({
              ...item,
              price: Number(item.price) ?? Number(item.unit_price) ?? 0,
              total: item.total != null ? Number(item.total) : undefined,
              discount: Number(item.discount) || 0,
              added_value: item.added_value ?? item.addedValuePercent,
            });

            const enriched = {
              ...item,
              id: item.id ?? item.item_id,
              quantity: qty,
              price: pricing.finalPrice,
              oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
              discount: pricing.discountPercentage,
              originalBasePrice: pricing.afterDiscount,
              taxAmount: pricing.taxAmount,
              addedValuePercent: pricing.taxPercentage,
              taxPercentage: pricing.taxPercentage,
              name: item.name ?? item.title,
              title: item.title ?? item.name,
              image_path: getProductImageUrl(item),
              imgSrc: getProductImageUrl(item),
            };

            return normalizeCartProduct(enriched);
          })
        : [];

      setCartProducts(normalizedItems);
    } catch (e) {
      console.error("Failed to load cart:", e);
    } finally {
      setIsCartLoading(false);
      loadCartDataInProgressRef.current = false;
    }
  };


  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };

const addProductToCart = async (product, qty, isModal = true) => {
  // Handle both product object and product ID
  const productId = typeof product === "object" ? product?.id : product;
  const outOfStockText = getOutOfStockText(isArabic ? "ar" : "en");

  if (typeof product === "object" && product && !isProductInStock(product)) {
    toast.error(outOfStockText);
    return;
  }

  // Keep in outer scope so catch can fallback to local state
  let item;

  try {
    setIsCartLoading(true);

    // Check if product already exists in cart (by product id, not cartId)
    const existingProduct = cartProducts.find(
      (i) => String(i.id) === String(productId)
    );

    if (existingProduct) {
      // Product exists in cart - increase quantity instead of adding duplicate
      const newQuantity = (Number(existingProduct.quantity) || 1) + (qty || 1);
      await updateQuantity(existingProduct.cartId, newQuantity);

      if (isModal) {
        openCartModal();
      }
      return;
    }

    const desiredQty = qty ? qty : 1;

    // Product object passed (some cards) OR ID passed (other places)
    if (typeof product === "object" && product) {
      // If the product object already includes VAT/tax info, use it as-is
      const hasVat =
        Number(
          product?.added_value ??
            product?.addedValuePercent ??
            product?.taxPercentage ??
            product?.addedValue
        ) > 0 || typeof product?.taxAmount === "number";

      if (hasVat) {
        item = { ...product, quantity: desiredQty };
      } else {
        // Enrich from API to ensure VAT shows in checkout (vercel vs local consistency)
        const enriched = await buildCartItemFromApi(productId, desiredQty);
        item = enriched || { ...product, quantity: desiredQty };
      }
    } else {
      const enriched = await buildCartItemFromApi(productId, desiredQty);
      if (!enriched) {
        const err = new Error(isArabic ? "المنتج غير متوفر" : "Product not found");
        err.code = "PRODUCT_NOT_FOUND";
        throw err;
      }
      item = enriched;
      if (!isProductInStock(item)) {
        toast.error(outOfStockText);
        return;
      }
    }

    if (!isProductInStock(item)) {
      toast.error(outOfStockText);
      return;
    }

    // Normalize the item and add unique cartId
    const normalizedItem = {
      ...normalizeCartProduct(item),
      cartId: `${productId}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    if (user !== null) {
      // User is authenticated - use API first, only update local state on success
      const weightValue = normalizedItem.weight || "";
      const res = await addToCartMutation.mutateAsync({ productId: Number(productId), desiredQty, weightValue });
      const isErrorResponse = (r) =>
        r?.status === "error" ||
        r?.error ||
        r?.message === "Unauthenticated.";
      if (isErrorResponse(res)) {
        const msg =
          res?.message ||
          (typeof res?.error === "string" ? res.error : null) ||
          (res?.error?.message) ||
          "Add to cart failed";
        const err = new Error(typeof msg === "string" ? msg : "Add to cart failed");
        err.apiResponse = res;
        throw err;
      }
      setCartProducts((pre) => [...pre, normalizedItem]);
    } else {
      // User not authenticated - use local state only
      setCartProducts((pre) => [...pre, normalizedItem]);
    }

    if (isModal) {
      openCartModal();
    }
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    const displayMsg =
      error?.message ||
      (error?.apiResponse?.message) ||
      (typeof error?.apiResponse?.error === "string" ? error.apiResponse.error : null) ||
      (isArabic ? "فشل إضافة المنتج للسلة" : "Failed to add product to cart");
    const isUnauth =
      String(displayMsg || "").toLowerCase().includes("unauthenticated") ||
      String(error?.apiResponse?.message || "").toLowerCase().includes("unauthenticated");
    toast.error(
      isUnauth
        ? isArabic
          ? "يرجى تسجيل الدخول مرة أخرى"
          : "Please log in again"
        : displayMsg
    );
    // Guest: fallback to local state. Auth: do NOT add locally (keeps backend in sync)
    if (item && user === null && isProductInStock(item)) {
      const normalizedItem = {
        ...normalizeCartProduct(item),
        cartId: `${productId}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };
      setCartProducts((pre) => [...pre, normalizedItem]);
      if (isModal) {
        openCartModal();
      }
    }
  } finally {
    setIsCartLoading(false);
  }
};


  const removeProductFromCart = async (productIdOrCartId) => {
    try {
      setIsCartLoading(true);

      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];

      // Find index of the exact item to remove (by cartId or id)
      const indexToRemove = currentCart.findIndex(
        (elm) =>
          String(elm.cartId) === String(productIdOrCartId) ||
          String(elm.id) === String(productIdOrCartId)
      );

      if (indexToRemove === -1) {
        console.warn("Item not found in cart:", productIdOrCartId);
        return;
      }

      const itemToRemove = currentCart[indexToRemove];

      if (user !== null) {
        // Authenticated: 1) remove via backend request, 2) fetch fresh cart from backend, 3) sync state + localStorage
        await removeFromCartMutation.mutateAsync(Number(itemToRemove.id));
        const cartData = await getCart();
        const items = cartData?.items || [];
        const normalizedItems = Array.isArray(items)
          ? items.map((item) => {
              const qty = Number(item?.pivot?.qty ?? item?.quantity ?? 1) || 1;
              const pricing = calcFinalPrice({
                ...item,
                price: Number(item.price) ?? Number(item.unit_price) ?? 0,
                total: item.total != null ? Number(item.total) : undefined,
                discount: Number(item.discount) || 0,
                added_value: item.added_value ?? item.addedValuePercent,
              });
              const enriched = {
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
                image_path: item.image_path ?? item.imgSrc,
                imgSrc: item.imgSrc ?? item.image_path,
              };
              return normalizeCartProduct(enriched);
            })
          : [];
        setCartProducts(normalizedItems);
        if (typeof window !== "undefined") {
          cartStorage.saveCart(normalizedItems);
          localStorage.removeItem("cart");
        }
      } else {
        // Guest: 1) remove from state, 2) persist to localStorage (no backend)
        const newCart = currentCart.filter((_, index) => index !== indexToRemove);
        setCartProducts(newCart);
        if (typeof window !== "undefined") {
          cartStorage.saveCart(newCart);
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
      // Fallback: remove from local state and localStorage
      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];
      const idx = currentCart.findIndex(
        (elm) =>
          String(elm.cartId) === String(productIdOrCartId) ||
          String(elm.id) === String(productIdOrCartId)
      );
      const newCart = idx >= 0 ? currentCart.filter((_, i) => i !== idx) : currentCart;
      setCartProducts(newCart);
      if (typeof window !== "undefined") {
        cartStorage.saveCart(newCart);
      }
    } finally {
      setIsCartLoading(false);
    }
  };

  const updateQuantity = async (idOrCartId, qty) => {
    try {
      setIsCartLoading(true);

      // Ensure cartProducts is an array
      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];

      // Try to find item by cartId first, then by id
      let item = currentCart.find(
        (elm) => elm.cartId === idOrCartId || elm.id === idOrCartId
      );

      if (!item) {
        console.warn("Item not found for quantity update:", idOrCartId);
        return;
      }

      // Update local state for both authenticated and non-authenticated users
      let items = [...currentCart];
      const itemIndex = items.findIndex(
        (elm) => elm.cartId === item.cartId
      );

      if (itemIndex !== -1) {
        items[itemIndex] = { ...items[itemIndex], quantity: qty / 1 };
        setCartProducts(items);
      }

      if (user !== null) {
        // User is authenticated - also update API (using product id, not cartId)
        await updateCartQuantityMutation.mutateAsync({ productId: item.id, qty });
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Fallback to local state on error
      const currentCart = Array.isArray(cartProducts) ? cartProducts : [];
      let item = currentCart.find(
        (elm) => elm.cartId === idOrCartId || elm.id === idOrCartId
      );

      if (item) {
        let items = [...currentCart];
        const itemIndex = items.findIndex(
          (elm) => elm.cartId === item.cartId
        );

        if (itemIndex !== -1) {
          items[itemIndex] = { ...items[itemIndex], quantity: qty / 1 };
          setCartProducts(items);
        }
      }
    } finally {
      setIsCartLoading(false);
    }
  };





  const wishListHas = (id) =>
    wishList.some((elm) => String(elm) === String(id));

  const isWishlistActionInProgress = (id) =>
    wishlistActionIds.some((x) => String(x) === String(id));

  const clearWishlistAction = (id) => {
    setWishlistActionIds((prev) => prev.filter((x) => String(x) !== String(id)));
  };

  const addToWishlist = (id) => {
    if (wishListHas(id)) return;
    const numId = Number(id) || id;
    const strId = String(id);
    setWishlistActionIds((prev) => [...prev.filter((x) => String(x) !== strId), numId]);
    setWishList((pre) => {
      const next = [...(Array.isArray(pre) ? pre : []).filter((e) => String(e) !== strId), numId];
      return next;
    });
    try {
      openWistlistModal();
    } catch (_) {
      /* never block add/remove */
    }
    if (user) {
      toggleWishlistMutation.mutateAsync(numId)
        .then(async () => {
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
          const favs = await getFavorites();
          const list = Array.isArray(favs) ? favs : favs?.data ?? favs?.favorites ?? [];
          const ids = (list || [])
            .map((f) => f.item_id ?? f.item?.id ?? f.id)
            .filter((v) => v != null && v !== "")
            .map((v) => Number(v) || v);
          setWishList(Array.from(new Set(ids)));
        })
        .catch(() => {})
        .finally(() => clearWishlistAction(id));
    } else {
      clearWishlistAction(id);
    }
  };

  const removeFromWishlist = (id) => {
    if (!wishListHas(id)) return;
    const numId = Number(id) || id;
    const strId = String(id);
    setWishlistActionIds((prev) => [...prev.filter((x) => String(x) !== strId), numId]);
    setWishList((pre) => (Array.isArray(pre) ? pre : []).filter((elm) => String(elm) !== strId));
    if (user) {
      toggleWishlistMutation.mutateAsync(numId)
        .then(async () => {
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
          const favs = await getFavorites();
          const list = Array.isArray(favs) ? favs : favs?.data ?? favs?.favorites ?? [];
          const ids = (list || [])
            .map((f) => f.item_id ?? f.item?.id ?? f.id)
            .filter((v) => v != null && v !== "")
            .map((v) => Number(v) || v);
          setWishList(Array.from(new Set(ids)));
        })
        .catch(() => {})
        .finally(() => clearWishlistAction(id));
    } else {
      clearWishlistAction(id);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => wishListHas(id);
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };

  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  // Load wishlist from localStorage on mount (guest or before auth sync)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const items = Array.isArray(raw) ? raw : [];
      const normalized = items.map((x) => (Number(x) || x));
      setWishList(normalized);
    } catch (_) {}
    setIsWishlistLoaded(true);
  }, []);

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isWishlistLoaded || typeof window === "undefined") return;
    try {
      const toSave = (Array.isArray(wishList) ? wishList : []).map((x) => Number(x) || x);
      localStorage.setItem("wishlist", JSON.stringify(toSave));
    } catch (_) {}
  }, [wishList, isWishlistLoaded]);

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    removeProductFromCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    isWishlistActionInProgress,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
    syncCartOnLogin,
    handleLogout,
    loadCartData,
    isCartLoading,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
