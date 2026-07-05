"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "@/router/Link";
import Image from "@/components/common/CompatImage";
import { useContextElement } from "@/context/Context";
import { getProduct, getFavorites } from "@/api/products";
import { useUserStore } from "@/store/userStore";
import { useLocale, useTranslations } from "@/i18n/react";
import { useQuery } from "@tanstack/react-query";
import { calcFinalPrice } from "@/utils/pricing";
import { getProductImageUrl } from "@/utils/productImage";


export default function Wishlist() {
  const { removeFromWishlist, wishList, isWishlistActionInProgress } =
    useContextElement();
  const { user } = useUserStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const locale = useLocale();
  const t = useTranslations("wishlist");

  const { data: favorites, isLoading: authLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!user,
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
  });

  const wishlistIds = React.useMemo(() => {
    const list = Array.isArray(wishList) ? wishList : [];
    return list.map((x) => String(x));
  }, [(Array.isArray(wishList) ? wishList : []).map(String).join(",")]);

  // Optimistic remove: update UI immediately for both guest and auth
  const handleRemove = (id) => {
    const strId = String(id);
    setItems((prev) => prev.filter((item) => item && String(item.id ?? item.item_id) !== strId));
    removeFromWishlist(id);
  };

  // Auth: derive items from favorites; support multiple API response shapes
  useEffect(() => {
    if (!user) return;
    const raw = Array.isArray(favorites) ? favorites : favorites?.data ?? favorites?.favorites ?? [];
    const list = Array.isArray(raw) ? raw : [];
    if (list.length === 0) {
      setItems([]);
      return;
    }
    const products = list
      .map((fav) => {
        const item = fav.item ?? fav;
        if (item && (item.id != null || item.item_id != null)) {
          return { ...item, id: item.id ?? item.item_id };
        }
        return null;
      })
      .filter(Boolean);
    setItems(products);
  }, [favorites, user]);

  // Guest: fetch product details for wishlist IDs
  useEffect(() => {
    if (user) return;
    const ids = wishlistIds.filter(Boolean);
    if (ids.length === 0) {
      setItems([]);
      hasInitiallyLoaded.current = true;
      return;
    }
    let cancelled = false;
    if (!hasInitiallyLoaded.current) setLoading(true);
    const fetchGuestWishlist = async () => {
      try {
        const productPromises = ids.map((id) => getProduct(Number(id) || id).catch(() => null));
        const results = await Promise.all(productPromises);
        if (cancelled) return;
        const products = results
          .filter((r) => r && (r.item || r.data || (r.id != null)))
          .map((r) => r.item || r.data || r)
          .filter((p) => p && (p.id != null || p.item_id != null))
          .map((p) => ({ ...p, id: p.id ?? p.item_id }));
        setItems(products);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching guest wishlist:", error);
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          hasInitiallyLoaded.current = true;
        }
      }
    };
    fetchGuestWishlist();
    return () => {
      cancelled = true;
    };
  }, [user, wishlistIds.join(",")]);

  const isLoading = user ? authLoading : loading;

  return (
    <div className="modal fullRight fade modal-wishlist" id="wishlist">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <h5 className="title">{t("title")}</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      {t("loading")}
                    </div>
                  ) : items && items.length ? (
                    <div className="tf-mini-cart-items">
                      {items.map((elm, i) => {
                        if (!elm) return null;

                        // Ensure consistent pricing (discount + VAT) for wishlist items
                        const pricing = calcFinalPrice({
                          ...elm,
                          price: Number(elm.price) || 0,
                          discount: Number(elm.discount) || 0,
                          added_value: elm.added_value,
                          total: elm.total,
                        });

                        const formattedPrice =
                          locale === "ar"
                            ? `ج.م ${pricing.finalPrice.toFixed(2)}`
                            : `EGP ${pricing.finalPrice.toFixed(2)}`;

                        return (
                          <div key={i} className="tf-mini-cart-item file-delete">
                            <div className="tf-mini-cart-image">
                              <Image
                                className="lazyload"
                                alt={elm.name || "Product image"}
                                src={getProductImageUrl(elm)}
                                width={600}
                                height={800}
                                loading="lazy"
                                fetchPriority="auto"
                              />
                            </div>
                            <div className="tf-mini-cart-info flex-grow-1">
                              <div className="mb_12 d-flex align-items-center justify-content-between flex-wrap gap-12">
                                <div className="text-title">
                                  <Link
                                    href={`/product-detail/${elm.id}-${elm.name}`}
                                    className="link text-line-clamp-1"
                                  >
                                    {elm.name}
                                  </Link>
                                </div>
                                <div
                                  className={`text-button tf-btn-remove remove ${isWishlistActionInProgress?.(elm.id) ? "opacity-50" : ""}`}
                                  style={{ pointerEvents: isWishlistActionInProgress?.(elm.id) ? "none" : undefined, cursor: isWishlistActionInProgress?.(elm.id) ? "wait" : "pointer" }}
                                  onClick={() => {
                                    if (isWishlistActionInProgress?.(elm.id)) return;
                                    handleRemove(elm.id);
                                  }}
                                >
                                  {isWishlistActionInProgress?.(elm.id) ? (
                                    <span className="spinner-border spinner-border-sm me-1" style={{ width: "0.9em", height: "0.9em", verticalAlign: "middle" }} />
                                  ) : null}
                                  {t("remove")}
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-12">
                                {/* <div className="text-secondary-2">XL/Blue</div> */}
                                <div className="text-button">
                                  {formattedPrice}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4">
                      {t("emptyMessage")}
                      <Link className="btn-line" href="/shop">
                        {" "}
                        {t("shop")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="tf-mini-cart-bottom">
                <Link
                  href="/wish-list"
                  className="btn-style-2 w-100 radius-4 view-all-wishlist"
                >
                  <span className="text-btn-uppercase">
                    {t("viewAll")}
                  </span>
                </Link>
                <Link
                  href="/shop"
                  className="text-btn-uppercase"
                >
                  {t("continueShopping")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
