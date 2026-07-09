"use client";
import React, { useCallback } from "react";
import { useTranslations } from "@/i18n/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductsOffers } from "@/api/products";
import { getCategories } from "@/api/categories";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("navigation");

  // Prefetch data on hover for instant navigation
  const handleMouseEnter = useCallback((href) => {
    // Prefetch the route
    router.prefetch(href);
    
    // Prefetch critical data for that route
    if (href === "/shop") {
      queryClient.prefetchQuery({
        queryKey: ["products", 1, false],
        queryFn: () => getProducts(1),
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
        staleTime: 10 * 60 * 1000,
      });
    } else if (href === "/offers") {
      queryClient.prefetchQuery({
        queryKey: ["products", 1, true],
        queryFn: () => getProductsOffers(1),
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [router, queryClient]);

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("shop"), href: "/shop" },
    { name: t("offers"), href: "/offers" },
    { name: t("storeList"), href: "/our-brands" },
    { name: t("exhibition"), href: "/exhibition" },
    { name: t("aboutUs"), href: "/about-us" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <>
      {navItems.map((item, index) => (
        <li
          key={index}
          className={`menu-item ${
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
              ? "active"
              : ""
          }`}
          onMouseEnter={() => handleMouseEnter(item.href)}
        >
          <Link 
            href={item.href} 
            className="item-link"
            prefetch={true}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </>
  );
}
