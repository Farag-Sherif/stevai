"use client";

import React, { useEffect, useState, useRef } from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";
import Link from "@/router/Link";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, getProduct } from "@/api/products";
import { useUserStore } from "@/store/userStore";
import { useLocale } from "@/i18n/react";
import { useContextElement } from "@/context/Context";
import { useTranslations } from "@/i18n/react";

export default function Wishlist() {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const { user } = useUserStore();
  const { wishList } = useContextElement();
  const [items, setItems] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const hasInitiallyLoaded = useRef(false);

  const {
    data: favorites,
    isLoading: authLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const wishlistIds = React.useMemo(
    () => (Array.isArray(wishList) ? wishList : []),
    [(Array.isArray(wishList) ? wishList : []).map(String).join(",")]
  );

  useEffect(() => {
    if (user) {
      const list = Array.isArray(favorites) ? favorites : favorites?.data ?? [];
      if (list.length > 0) {
        const mappedItems = list
          .map((fav) => fav.item ?? fav)
          .filter((item) => item != null && item.id != null);
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    }
  }, [favorites, user]);

  useEffect(() => {
    if (user) return;
    const fetchGuestWishlist = async () => {
      if (wishlistIds.length === 0) {
        setItems([]);
        hasInitiallyLoaded.current = true;
        return;
      }
      if (!hasInitiallyLoaded.current) setGuestLoading(true);
      try {
        const productPromises = wishlistIds.map((id) =>
          getProduct(id).catch(() => null)
        );
        const results = await Promise.all(productPromises);
        const products = results
          .filter((r) => r && (r.item || r.data))
          .map((r) => r.item || r.data);
        setItems(products);
      } catch (err) {
        console.error("Error fetching guest wishlist:", err);
        setItems([]);
      } finally {
        setGuestLoading(false);
        hasInitiallyLoaded.current = true;
      }
    };
    fetchGuestWishlist();
  }, [wishlistIds, user]);

  const isLoading = user ? authLoading : guestLoading;

  // Loading state
  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">
                {t("loading")}
              </span>
            </div>
            <p className="mt-2 text-secondary">
              {t("loading")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error state (only relevant for auth user really, or if major network err)
  if (error && user) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="p-5 text-center">
            <p className="text-danger">
              {t("error")}
            </p>
            <Link className="btn-line" href="/shop">
              {t("shop")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Render logic handling both empty states
  return (
    <section className="flat-spacing">
      <div className="container">
        {items.length ? (
          <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4">
            {/* card product 1 */}
            {items.map((product, i) => (
              <ProductCard1 key={i} product={product} wishList={true} />
            ))}

            {/* pagination */}
            {items.length > 10 && (
              <ul className="wg-pagination justify-content-center">
                <Pagination />
              </ul>
            )}
          </div>
        ) : (
          <div className="p-5 text-center">
            {t("emptyMessage")}{" "}
            <div className="mt-3">
              <Link className="btn-line" href="/shop">
                {t("shop")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
