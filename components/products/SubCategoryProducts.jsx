"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubCategoryById } from "@/api/categories";
import SubCategoriesFilter from "./SubCategoriesFilter";
import Products from "./Products";

export default function SubCategoryProducts({ 
  subCategoryId,
  subCategoryName,
  offers = false 
}) {
  // When on a sub-category page, that sub-category should be active
  // But if subCategoryId is null/undefined, "All" should be active
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(
    subCategoryId && subCategoryId !== "null" && subCategoryId !== "undefined" 
      ? subCategoryId 
      : null
  );
  const [parentCategoryId, setParentCategoryId] = useState(null);

  // Fetch sub-category details to get parent category ID
  const { data: subCategoryData, error: subCategoryError } = useQuery({
    queryKey: ["subCategory", subCategoryId],
    queryFn: () => getSubCategoryById(subCategoryId),
    enabled: !!subCategoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });

  // Debug: Log subCategoryId and errors
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("SubCategoryProducts - subCategoryId:", subCategoryId);
      if (subCategoryError) {
        console.error("SubCategoryProducts - Error fetching sub-category:", subCategoryError);
      }
    }
  }, [subCategoryId, subCategoryError]);

  // Update parent category ID when sub-category data is loaded
  // Response structure: [{ data: { cafe_id: 20, ... }, items: [...] }]
  useEffect(() => {
    // Debug: Log response structure in development
    if (process.env.NODE_ENV !== "production" && subCategoryData) {
      console.log("SubCategoryProducts - subCategoryData:", subCategoryData);
    }
    
    const subCategory = Array.isArray(subCategoryData) 
      ? subCategoryData[0] 
      : subCategoryData;
    
    if (subCategory?.data?.cafe_id) {
      setParentCategoryId(subCategory.data.cafe_id);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("SubCategoryProducts - No cafe_id found in response:", subCategory);
    }
  }, [subCategoryData]);

  // Update selected sub-category when prop changes
  // Only set if subCategoryId is valid, otherwise keep null (so "All" stays active)
  useEffect(() => {
    setSelectedSubCategoryId(
      subCategoryId && subCategoryId !== "null" && subCategoryId !== "undefined"
        ? subCategoryId
        : null
    );
  }, [subCategoryId]);

  const handleSubCategoryChange = (newSubCategoryId) => {
    setSelectedSubCategoryId(newSubCategoryId);
  };

  // Handle error state
  if (subCategoryError) {
    return (
      <div className="flat-spacing pt-0">
        <div className="container">
          <div className="text-center py-5">
            <p className="text-danger">
              {process.env.NODE_ENV !== "production" 
                ? `Error loading sub-category: ${subCategoryError.message || "Unknown error"}` 
                : "Error loading sub-category. Please try again."}
            </p>
            <p className="text-muted small mt-2">
              {process.env.NODE_ENV !== "production" && `SubCategoryId: ${subCategoryId}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render until we have the parent category ID or error occurred
  if (!parentCategoryId && !subCategoryData && !subCategoryError) {
    return (
      <div className="flat-spacing pt-0">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SubCategoriesFilter
        categoryId={parentCategoryId}
        currentSubCategoryId={selectedSubCategoryId}
        onSubCategoryChange={handleSubCategoryChange}
        showAllButton={true}
        allButtonHref={parentCategoryId ? `/collections/${parentCategoryId}-${encodeURIComponent(subCategoryName || "")}` : "/shop"}
      />
      <Products
        subCategoryId={selectedSubCategoryId}
        categoryId={parentCategoryId}
        order={1}
        parentClass="flat-spacing pt-0"
        offers={offers}
      />
    </>
  );
}

