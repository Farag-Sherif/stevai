"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "@/i18n/react";

export default function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const sections = [
    {
      title: t("shop"),
      hint: t("shopHint"),
      href: "/shop",
    },
    {
      title: t("offers"),
      hint: t("offersHint"),
      href: "/offers",
    },
    {
      title: t("collections"),
      hint: t("collectionsHint"),
      href: "/collections",
    },
    {
      title: t("ourBrands"),
      hint: t("ourBrandsHint"),
      href: "/our-brands",
    },
  ];

  return (
    <aside
      className="tf-sidebar tf-sidebar--sticky"
      style={{
        position: "sticky",
        top: "100px",
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="tf-sidebar__head" style={{ fontWeight: 700, marginBottom: 12 }}>
        {t("title")}
      </div>
      <ul className="tf-sidebar__list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {sections.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <li
              key={item.href}
              className="tf-sidebar__item"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 8px",
                borderRadius: 10,
                transition: "background 0.2s ease",
                background: isActive ? "rgba(2, 148, 101, 0.1)" : "transparent",
              }}
            >
              <Link
                href={item.href}
                title={item.hint}
                className="tf-sidebar__link"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  color: isActive ? "#029465" : "#222",
                  textDecoration: "none",
                  width: "100%",
                }}
              >
                <span
                  className="tf-sidebar__text"
                  style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    className="tf-sidebar__dot"
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      background: isActive ? "#029465" : "#ff6b6b",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  {item.title}
                </span>
                <span className="tf-sidebar__hint" style={{ color: "#555", fontSize: 13 }}>
                  {item.hint}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

