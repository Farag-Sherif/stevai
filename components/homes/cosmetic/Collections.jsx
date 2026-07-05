"use client";

import React, { useState, useRef } from "react";
import Link from "@/router/Link";
import Image from "@/components/common/CompatImage";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "@/i18n/react";
import { getCategories, getSubCategories } from "@/api/categories";

export default function Collections() {
  const t = useTranslations("categories");
  const locale = useLocale();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const categoryRefs = useRef({});

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const {
    data: subCategories,
  } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubCategories(),
  });

  // Group subcategories by category id
  const subCategoriesByCategory = React.useMemo(() => {
    if (!subCategories || !categories) return {};
    const subCatsArray = Array.isArray(subCategories) ? subCategories : [];
    const grouped = {};
    subCatsArray.forEach((sub) => {
      const categoryId = sub.category_id;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(sub);
    });
    return grouped;
  }, [subCategories, categories]);

  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading">{t("shop_by_skin_concern")}</h3>
            <p className="subheading text-secondary">
              {t("fresh_styles_subtitle")}
            </p>
          </div>
          <div className="tf-grid-layout tf-col-2 md-col-3 collections-category-cards">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="collection-position-2 style-6">
                <div
                  className="img-style animate-pulse bg-gray-200"
                  style={{ height: 615 }}
                ></div>
                <div className="content">
                  <div className="cls-btn">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading">{t("shop_by_skin_concern")}</h3>
            <p className="subheading text-secondary text-red-500">
              {t("error_loading_categories")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("shop_by_skin_concern")}</h3>
          <p className="subheading text-secondary">
            {t("fresh_styles_subtitle")}
          </p>
        </div>
        <div className="tf-grid-layout tf-col-2 md-col-3 collections-category-cards">
          {categories?.map((category, index) => {
            const subCats = subCategoriesByCategory[category.id] || [];
            return (
              <div
                className="collection-position-2 style-6 hover-img wow fadeInUp"
                data-wow-delay={`${index * 0.1}s`}
                key={category.id}
                ref={(el) => {
                  if (el) categoryRefs.current[category.id] = el;
                }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{ position: "relative" }}
              >
                <Link
                  href={`/collections/${category.id}-${category.name}`}
                  className="img-style"
                >
                  <Image
                    className="ls-is-cached lazyloaded"
                    alt={category.name}
                    src={category.logo_path || "/images/placeholder-category.jpg"}
                    width={615}
                    height={615}
                    onError={(e) => {
                      e.target.src = "/images/placeholder-category.jpg";
                    }}
                  />
                </Link>
                <div className="content">
                  <Link
                    href={`/collections/${category.id}-${category.name}`}
                    className="cls-btn"
                  >
                    <h6 className="text-custom">{category.name}</h6>
                  </Link>
                </div>
                {hoveredCategory === category.id && categoryRefs.current[category.id] && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginTop: "12px",
                      background: "#fff",
                      padding: "14px 18px",
                      borderRadius: "10px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                      border: "2px solid rgba(2, 148, 101, 0.2)",
                      fontSize: "13px",
                      color: "#333",
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                      pointerEvents: "none",
                      maxWidth: "280px",
                      minWidth: "200px",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "6px", color: "var(--main, #029465)", fontSize: "14px" }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.5" }}>
                      {category.description
                        ? category.description
                        : subCats.length > 0
                          ? (locale === "ar" ? "يتضمن: " : "Includes: ") +
                          subCats
                            .slice(0, 4)
                            .map((sub) => sub.name)
                            .join(locale === "ar" ? "، " : ", ")
                          : locale === "ar"
                            ? "تصفح جميع المنتجات في هذا القسم"
                            : "Browse all products in this category"}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "-8px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderBottom: "8px solid #fff",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "9px solid transparent",
                        borderRight: "9px solid transparent",
                        borderBottom: "9px solid rgba(2, 148, 101, 0.2)",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
