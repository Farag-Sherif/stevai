"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getSubCategories, getSubCafesByCategoryId } from "@/api/categories";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n/react";
import Image from "@/components/common/CompatImage";

export default function CategoriesSidebar() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const categoryRefs = useRef({});
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  const {
    data: subCategories,
    isLoading: subCategoriesLoading,
    error: subCategoriesError,
  } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  // Helper function to get category description from translations
  const getCategoryDescription = React.useCallback((category) => {
    // First try to get description from translations array for current locale
    if (category?.translations && Array.isArray(category.translations)) {
      const translation = category.translations.find(
        (t) => t.locale === locale
      );
      if (translation?.description) {
        return translation.description;
      }
    }
    // Fallback to main description field
    if (category?.description) {
      return category.description;
    }
    return null;
  }, [locale]);

  // Group subcategories by category id
  const subCategoriesByCategory = React.useMemo(() => {
    if (!subCategories || !categories) return {};
    // Ensure subCategories is an array
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

  // Fetch subcategories for a specific category
  const CategorySubCategories = ({ categoryId }) => {
    const { data: subCafesData, isLoading: isLoadingSubCafes } = useQuery({
      queryKey: ["subCafes", categoryId],
      queryFn: () => getSubCafesByCategoryId(categoryId),
      enabled: expandedCategories[categoryId] && !!categoryId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      placeholderData: (previousData) => previousData,
    });

    const subCatsList = React.useMemo(() => {
      if (subCafesData && Array.isArray(subCafesData) && subCafesData.length > 0) {
        return subCafesData.map((item) => {
          const subcategory = item.data || item;
          if (!subcategory || !subcategory.id) return null;
          const translation = subcategory.translations?.find((t) => t.locale === locale) || subcategory.translations?.[0];
          return {
            id: subcategory.id,
            name: translation?.name || subcategory.name || "",
            slug: `${subcategory.id}-${encodeURIComponent(translation?.name || subcategory.name || "")}`,
            image: subcategory.logo_path || subcategory.image || null,
          };
        }).filter(Boolean);
      }
      // Fallback to static subcategories if available
      return subCategoriesByCategory[categoryId] || [];
    }, [subCafesData, categoryId, locale, subCategoriesByCategory]);

    if (!expandedCategories[categoryId]) return null;

    if (isLoadingSubCafes) {
      return (
        <ul
          style={{
            listStyle: "none",
            margin: "8px 0 0 0",
            padding: 0,
            paddingRight: isRTL ? "20px" : "0",
            paddingLeft: isRTL ? "0" : "20px",
          }}
        >
          <li style={{ padding: "8px", textAlign: "center", color: "#999", fontSize: "13px" }}>
            {locale === "ar" ? "جاري التحميل..." : "Loading..."}
          </li>
        </ul>
      );
    }

    if (!subCatsList || subCatsList.length === 0) {
      return (
        <ul
          style={{
            listStyle: "none",
            margin: "8px 0 0 0",
            padding: 0,
            paddingRight: isRTL ? "20px" : "0",
            paddingLeft: isRTL ? "0" : "20px",
          }}
        >
          <li style={{ padding: "8px", textAlign: "center", color: "#999", fontSize: "13px" }}>
            {locale === "ar" ? "لا توجد أقسام فرعية" : "No subcategories"}
          </li>
        </ul>
      );
    }

    return (
      <ul
        style={{
          listStyle: "none",
          margin: "8px 0 0 0",
          padding: 0,
          paddingRight: isRTL ? "20px" : "0",
          paddingLeft: isRTL ? "0" : "20px",
        }}
      >
        {subCatsList.map((sub) => (
          <li
            key={sub.id}
            style={{
              marginBottom: "4px",
            }}
          >
            <Link
              href={`/products/${sub.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#666",
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--main, #029465)";
                e.currentTarget.style.background = "rgba(2, 148, 101, 0.08)";
                e.currentTarget.style.fontWeight = "600";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#666";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.fontWeight = "400";
              }}
            >
              <span>{sub.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (categoriesLoading || subCategoriesLoading) {
    return (
      <aside
        className="categories-sidebar"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "300px",
          background: "#fff",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          zIndex: 1040,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <div className="text-center">جاري التحميل...</div>
      </aside>
    );
  }

  if (categoriesError || subCategoriesError || !categories) {
    return null;
  }

  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  if (categoriesArray.length === 0) {
    return (
      <aside
        className="categories-sidebar"
        style={{
          height: "100%",
          width: "100%",
          background: "#fff",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <div className="text-center">لا توجد أقسام متاحة</div>
      </aside>
    );
  }

  return (
    <aside
      className="categories-sidebar"
      onClick={(e) => {
        // Prevent clicks inside sidebar from bubbling to backdrop
        e.stopPropagation();
      }}
      style={{
        height: "100%",
        width: "100%",
        background: "var(--main, #029465)",
        overflowY: "auto",
        padding: "0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="sidebar-header"
        style={{
          background: "var(--main, #029465)",
          padding: "20px",
          borderBottom: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#fff" }}>
          {locale === "ar" ? "جميع الأقسام والفروع" : "All Categories & Branches"}
        </h3>
      </div>

      <div
        style={{
          flex: 1,
          background: "#fff",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          padding: "16px 12px",
          overflowY: "auto",
        }}
      >
        <div className="categories-list">
          {categoriesArray.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const subCats = subCategoriesByCategory[category.id] || [];
          // Always show arrow for all categories - let API determine if subcategories exist
          return (
            <div
              key={category.id}
              className="category-item"
              style={{
                marginBottom: "8px",
                paddingBottom: "8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                ref={(el) => {
                  if (el) categoryRefs.current[category.id] = el;
                }}
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Link
                    href={`/collections/${category.id}-${encodeURIComponent(category.name || "")}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#333",
                      textDecoration: "none",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      flex: 1,
                    }}
                    onMouseEnter={(e) => {
                      setHoveredCategory(category.id);
                      e.currentTarget.style.color = "var(--main, #029465)";
                      e.currentTarget.style.background = "rgba(2, 148, 101, 0.08)";
                      e.currentTarget.style.border = "1px solid rgba(2, 148, 101, 0.2)";
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.fontWeight = "700";
                      const dot = e.currentTarget.querySelector('.category-dot');
                      if (dot) dot.style.background = "var(--main, #029465)";
                    }}
                    onMouseLeave={(e) => {
                      setHoveredCategory(null);
                      e.currentTarget.style.color = "#333";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.fontWeight = "600";
                      const dot = e.currentTarget.querySelector('.category-dot');
                      if (dot) dot.style.background = "#ccc";
                    }}
                  >
                    <span
                      className="category-dot"
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#ccc",
                        transition: "all 0.25s ease",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, lineHeight: "1.5" }}>{category.name}</span>
                  </Link>
                  {/* Always show arrow button for all categories */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                    onMouseEnter={() => setHoveredCategory(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isExpanded ? "var(--main, #029465)" : "#999",
                      transition: "all 0.25s ease",
                      borderRadius: "4px",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(2, 148, 101, 0.1)";
                      e.currentTarget.style.color = "var(--main, #029465)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = isExpanded ? "var(--main, #029465)" : "#999";
                    }}
                    aria-label={isExpanded ? (locale === "ar" ? "إخفاء الأقسام الفرعية" : "Hide subcategories") : (locale === "ar" ? "إظهار الأقسام الفرعية" : "Show subcategories")}
                    aria-expanded={isExpanded}
                  >
                    <i
                      className={isRTL ? "icon icon-arrLeft" : "icon icon-arrRight"}
                      style={{
                        transform: isExpanded ? (isRTL ? "rotate(-90deg)" : "rotate(90deg)") : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        fontSize: "16px",
                      }}
                    />
                  </button>
                </div>
                {/* Hover Popup */}
                {hoveredCategory === category.id && categoryRefs.current[category.id] && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: isRTL ? "auto" : "0",
                      right: isRTL ? "0" : "auto",
                      marginTop: "8px",
                      background: "#fff",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(2, 148, 101, 0.2)",
                      fontSize: "13px",
                      color: "#333",
                      whiteSpace: "normal",
                      zIndex: 1000,
                      pointerEvents: "none",
                      maxWidth: "280px",
                      minWidth: "200px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "6px", color: "var(--main, #029465)", fontSize: "14px" }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                      {(() => {
                        const description = getCategoryDescription(category);
                        if (description) {
                          return description;
                        }
                        if (subCats.length > 0) {
                          return (locale === "ar"
                            ? "يتضمن: "
                            : "Includes: ") +
                          subCats
                            .slice(0, 3)
                            .map((sub) => sub.name)
                            .join(locale === "ar" ? "، " : ", ");
                        }
                        return locale === "ar"
                          ? "تصفح جميع المنتجات في هذا القسم"
                          : "Browse all products in this category";
                      })()}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "-6px",
                        left: isRTL ? "auto" : "20px",
                        right: isRTL ? "20px" : "auto",
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderBottom: "6px solid #fff",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Always render CategorySubCategories - it will handle empty state */}
              <CategorySubCategories categoryId={category.id} />
            </div>
          );
        })}
        </div>
      </div>
    </aside>
  );
}

