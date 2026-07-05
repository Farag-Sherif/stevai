"use client";
import React, { useState, useRef } from "react";
import Image from "@/components/common/CompatImage";
import { getCategories, getSubCategories, getSubCafesByCategoryId } from "@/api/categories";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n/react";
import { useRouter, Link } from "@/i18n/navigation";

export default function Categories() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const categoryRefs = useRef({});
  
  const {
    data: categories,
    isLoading,
    error,
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
        <div className="collapse show">
          <ul className="facet-body">
            <li>
              <div className="item link" style={{ padding: "12px", textAlign: "center", color: "#999" }}>
                {locale === "ar" ? "جاري التحميل..." : "Loading..."}
              </div>
            </li>
          </ul>
        </div>
      );
    }

    if (!subCatsList || subCatsList.length === 0) {
      return (
        <div className="collapse show">
          <ul className="facet-body">
            <li>
              <div className="item link" style={{ padding: "12px", textAlign: "center", color: "#999" }}>
                {locale === "ar" ? "لا توجد أقسام فرعية" : "No subcategories"}
              </div>
            </li>
          </ul>
        </div>
      );
    }

    return (
      <div className="collapse show">
        <ul className="facet-body">
          {subCatsList.map((subcategory) => (
            <li key={subcategory.id}>
              <Link
                href={`/products/${subcategory.slug}`}
                className="item link"
                onClick={() => {
                  // Close the modal
                  const modal = document.getElementById("shopCategories");
                  if (modal) {
                    modal.classList.remove("show");
                    modal.setAttribute("aria-hidden", "true");
                    modal.style.display = "none";
                    const backdrop = document.querySelector(".offcanvas-backdrop");
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove("offcanvas-open");
                    document.body.style.overflow = "";
                    document.body.style.paddingRight = "";
                  }
                }}
              >
                <span className="title-sub text-caption-1 text-secondary">
                  {subcategory.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategoryClick = (category) => {
    // Close the modal first
    const modal = document.getElementById("shopCategories");
    if (modal) {
      // Use the data-bs-dismiss approach which is more reliable
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";

      // Remove backdrop
      const backdrop = document.querySelector(".offcanvas-backdrop");
      if (backdrop) {
        backdrop.remove();
      }

      // Remove modal-open class from body
      document.body.classList.remove("offcanvas-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Navigate after a small delay to ensure modal is closed
    setTimeout(() => {
      router.push(`/products/${category?.id}-${category?.name}`);
    }, 100);
  };

  return (
    <div
      className="offcanvas offcanvas-start canvas-filter canvas-categories"
      id="shopCategories"
    >
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <span className="icon-left icon-filter" />
          <h5>{locale === "ar" ? "الأقسام" : "Collections"}</h5>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body">
          {isLoading && (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              Error loading categories. Please try again.
            </div>
          )}

          {categories && categories.length > 0
            ? categories.map((category) => {
                const isExpanded = expandedCategories[category.id];
                const subCats = subCategoriesByCategory[category.id] || [];
                return (
                <div 
                  key={category.id} 
                  className="wd-facet-categories"
                >
                  <div
                    ref={(el) => {
                      if (el) categoryRefs.current[category.id] = el;
                    }}
                    style={{ position: "relative" }}
                  >
                    <div
                      className="facet-title item link d-flex align-items-center w-100"
                      style={{ 
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                      onClick={() => {
                        // Always toggle subcategories on click - if no subcategories, API will return empty
                        toggleCategory(category.id);
                      }}
                      onMouseEnter={(e) => {
                        setHoveredCategory(category.id);
                        e.currentTarget.style.color = "var(--main, #029465)";
                        e.currentTarget.style.background = "rgba(2, 148, 101, 0.1)";
                        e.currentTarget.style.borderRadius = "8px";
                        e.currentTarget.style.padding = "8px";
                      }}
                      onMouseLeave={(e) => {
                        setHoveredCategory(null);
                        e.currentTarget.style.color = "inherit";
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderRadius = "0";
                        e.currentTarget.style.padding = "0";
                      }}
                    >
                    <Image
                      className="avt"
                      alt={category.title || category.name}
                      src={
                        category.logo_path ||
                        category.image ||
                        "/images/avatar/user-default.jpg"
                      }
                      width={48}
                      height={48}
                      onError={(e) => {
                        if (e.target.src !== "/images/avatar/user-default.jpg") {
                          e.target.src = "/images/avatar/user-default.jpg";
                        }
                      }}
                      unoptimized={(category.logo_path || category.image)?.startsWith('http')}
                      style={{
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <span className="title" style={{ flex: 1 }}>
                      {category.title || category.name}
                    </span>
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
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isExpanded ? "var(--main, #029465)" : "#999",
                        transition: "all 0.25s ease",
                        borderRadius: "4px",
                        marginLeft: isRTL ? "0" : "8px",
                        marginRight: isRTL ? "8px" : "0",
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
                          {category.title || category.name}
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
              })
            : !isLoading &&
              !error && (
                <div className="text-center p-4">
                  <p className="text-muted">No categories available</p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
