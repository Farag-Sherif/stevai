"use client";

import React, { useState, useEffect,useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubCafesByCategoryId, getSubCategoryById, getSubCategories } from "@/api/categories";
import { useLocale } from "@/i18n/react";
import { useRouter } from "@/i18n/navigation";

export default function SubCategoriesFilter({ 
  categoryId = null, 
  currentSubCategoryId = null,
  onSubCategoryChange = null,
  showAllButton = true,
  allButtonHref = "/shop"
}) {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const buttonRef = useRef(null)
  // Get categoryId from current sub-category if not provided
  const [parentCategoryId, setParentCategoryId] = useState(categoryId);
  // Default to null (showing all sub-categories) if no currentSubCategoryId is provided
  // This ensures "All" button is active by default when page loads
  // Only set a specific sub-category if currentSubCategoryId is a valid, non-empty value
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(() => {
    // Check if currentSubCategoryId is valid and not empty/null/undefined/0
    if (
      currentSubCategoryId !== undefined && 
      currentSubCategoryId !== null && 
      currentSubCategoryId !== 0 &&
      currentSubCategoryId !== "" &&
      currentSubCategoryId !== "null" &&
      currentSubCategoryId !== "undefined"
    ) {
      return currentSubCategoryId;
    }
    // Default to null so "All" tab is active
    return null;
  });
  
  // Update parentCategoryId when categoryId prop changes
  useEffect(() => {
    if (categoryId) {
      setParentCategoryId(categoryId);
    }
  }, [categoryId]);
  
  // Fetch sub-category details to get parent category ID
  const { data: subCategoryData } = useQuery({
    queryKey: ["subCategory", currentSubCategoryId],
    queryFn: () => getSubCategoryById(currentSubCategoryId),
    enabled: !!currentSubCategoryId && !categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  // Update selected sub-category when prop changes
  useEffect(() => {
    // Ensure null when no sub-category is selected (so "All" stays active)
    // Only set a specific sub-category if currentSubCategoryId is a valid, non-empty value
    if (
      currentSubCategoryId !== undefined && 
      currentSubCategoryId !== null && 
      currentSubCategoryId !== 0 &&
      currentSubCategoryId !== "" &&
      currentSubCategoryId !== "null" &&
      currentSubCategoryId !== "undefined"
    ) {
      setSelectedSubCategoryId(currentSubCategoryId);
    } else {
      // Default to null so "All" tab is active
      setSelectedSubCategoryId(null);
    }
  }, [currentSubCategoryId]);

  // Update parent category ID when sub-category data is loaded
  // Response structure: [{ data: { cafe_id: 20, ... }, items: [...] }]
  useEffect(() => {
    if (!categoryId && subCategoryData) {
      const subCategory = Array.isArray(subCategoryData) 
        ? subCategoryData[0] 
        : subCategoryData;
      
      if (subCategory?.data?.cafe_id) {
        setParentCategoryId(subCategory.data.cafe_id);
      }
    }
  }, [subCategoryData, categoryId]);

  // Fetch all sub-categories if no categoryId is available
  const { data: allSubCategories } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubCategories(),
    enabled: !parentCategoryId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  // Fetch sub-categories by parent category ID
  const { data: subCafes, isLoading, error: subCafesError } = useQuery({
    queryKey: ["subCafes", parentCategoryId],
    queryFn: () => getSubCafesByCategoryId(parentCategoryId),
    enabled: !!parentCategoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  // Debug: Log data for troubleshooting (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (parentCategoryId) {
        console.log("SubCategoriesFilter - parentCategoryId:", parentCategoryId);
        console.log("SubCategoriesFilter - subCafes:", subCafes);
        console.log("SubCategoriesFilter - isLoading:", isLoading);
        console.log("SubCategoriesFilter - error:", subCafesError);
      }
    }
  }, [parentCategoryId, subCafes, isLoading, subCafesError]);

  // Extract sub-categories from the response
  const subCategories = React.useMemo(() => {
    // If we have subCafes from a specific category, use those
    if (subCafes && Array.isArray(subCafes) && subCafes.length > 0) {
      return subCafes.map((item) => {
        // Handle different response structures: { data: {...}, items: [...] } or direct object
        const subcategory = item.data || item;
        if (!subcategory || !subcategory.id) {
          return null;
        }
        
        const translation = subcategory.translations?.find(
          (t) => t.locale === locale
        ) || subcategory.translations?.[0];
        
        return {
          id: subcategory.id,
          name: translation?.name || subcategory.name || "",
          slug: `${subcategory.id}-${encodeURIComponent(translation?.name || subcategory.name || "")}`,
          itemsCount: item.items?.length || 0,
        };
      }).filter(Boolean); // Remove null entries
    }
    
    // Otherwise, use all sub-categories
    if (allSubCategories && Array.isArray(allSubCategories) && allSubCategories.length > 0) {
      return allSubCategories.map((subcategory) => {
        if (!subcategory || !subcategory.id) {
          return null;
        }
        
        const translation = subcategory.translations?.find(
          (t) => t.locale === locale
        ) || subcategory.translations?.[0];
        
        return {
          id: subcategory.id,
          name: translation?.name || subcategory.name || "",
          slug: `${subcategory.id}-${encodeURIComponent(translation?.name || subcategory.name || "")}`,
          itemsCount: 0, // We don't have items count for all sub-categories
        };
      }).filter(Boolean); // Remove null entries
    }
    
    return [];
  }, [subCafes, allSubCategories, locale]);

  // Show loading state
  const isLoadingSubCategories = parentCategoryId ? (isLoading && !subCafes) : !allSubCategories;
  
  // Define handlers before conditional return to avoid hook order issues
  const handleSubCategoryClick = React.useCallback((subCategoryId, e) => {
    e.preventDefault();
    setSelectedSubCategoryId(subCategoryId);
    if (onSubCategoryChange) {
      onSubCategoryChange(subCategoryId);
    } else {
      // Navigate to sub-category page - find slug from current subCategories
      const currentSubCategories = subCafes && Array.isArray(subCafes) 
        ? subCafes.map((item) => {
            const subcategory = item.data || item;
            const translation = subcategory.translations?.find(
              (t) => t.locale === locale
            ) || subcategory.translations?.[0];
            return {
              id: subcategory.id,
              slug: `${subcategory.id}-${encodeURIComponent(translation?.name || subcategory.name || "")}`,
            };
          })
        : allSubCategories && Array.isArray(allSubCategories)
        ? allSubCategories.map((subcategory) => {
            const translation = subcategory.translations?.find(
              (t) => t.locale === locale
            ) || subcategory.translations?.[0];
            return {
              id: subcategory.id,
              slug: `${subcategory.id}-${encodeURIComponent(translation?.name || subcategory.name || "")}`,
            };
          })
        : [];
      
      const subCategory = currentSubCategories.find((sc) => sc.id === subCategoryId);
      if (subCategory) {
        router.push(`/products/${subCategory.slug}`);
      }
    }
  }, [subCafes, allSubCategories, locale, onSubCategoryChange, router]);

  const handleAllClick = React.useCallback((e) => {
    buttonRef.current.focus();
    e.preventDefault();
    setSelectedSubCategoryId(null);
    if (onSubCategoryChange) {
      onSubCategoryChange(null);
    } else {
      router.push(allButtonHref);
    }
  }, [onSubCategoryChange, router, allButtonHref]);

  // Prepare buttons array with proper order for RTL/LTR
  const buttons = React.useMemo(() => {
    // Determine if "All" button should be active
    // Active when selectedSubCategoryId is null, undefined, 0, or empty string
    const isAllActive = !selectedSubCategoryId;
    
    const allButton = showAllButton ? (
      <button
        key="all"
        onClick={handleAllClick}
        className={`sub-category-btn ${isAllActive ? "active" : ""}`}
        type="button"
        aria-pressed={isAllActive}
        ref={buttonRef}
      >
        {locale === "ar" ? "الكل" : "All"}
      </button>
    ) : null;

    const subCategoryButtons = subCategories.map((subCategory) => {
      const isActive = selectedSubCategoryId && (
        selectedSubCategoryId === subCategory.id.toString() || 
        selectedSubCategoryId === subCategory.id
      );
      return (
        <button
          key={subCategory.id}
          onClick={(e) => handleSubCategoryClick(subCategory.id, e)}
          className={`sub-category-btn ${isActive ? "active" : ""}`}
          type="button"
          ref={buttonRef}
        >
          {subCategory.name}
          {subCategory.itemsCount > 0 ? (
            <span className="items-count">({subCategory.itemsCount})</span>
          ) : null}
        </button>
      );
    });

    // For RTL (Arabic): All button on the right, sub-categories on the left
    // For LTR (English): All button on the left, sub-categories on the right
    return isRTL ? [...subCategoryButtons, allButton] : [allButton, ...subCategoryButtons];
  }, [subCategories, selectedSubCategoryId, locale, isRTL, showAllButton, handleAllClick, handleSubCategoryClick]);
  
  // If no sub-categories available, don't render (but after all hooks)
  if (!isLoadingSubCategories && (!subCategories || subCategories.length === 0)) {
    return null;
  }

  return (
    <div className="sub-categories-filter mb-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container">
        <div className={`d-flex flex-wrap align-items-center justify-content-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`} style={{ minHeight: "50px" }}>
          {isLoadingSubCategories && subCategories.length === 0 && !subCafes && !allSubCategories ? (
            <span className="text-muted d-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
            </span>
          ) : (
            buttons
          )}
        </div>
      </div>
    </div>
  );
}

