"use client";

import React, { useState } from "react";
import SubCategoriesFilter from "./SubCategoriesFilter";
import Products from "./Products";

export default function CategoryProducts({ 
  categoryId, 
  categoryName,
  offers = false 
}) {
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);

  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategoryId(subCategoryId);
  };

  return (
    <>
      <SubCategoriesFilter
        categoryId={categoryId}
        currentSubCategoryId={selectedSubCategoryId}
        onSubCategoryChange={handleSubCategoryChange}
        showAllButton={true}
        allButtonHref={`/collections/${categoryId}-${encodeURIComponent(categoryName || "")}`}
      />
      <Products
        subCategoryId={selectedSubCategoryId}
        categoryId={categoryId}
        order={1}
        parentClass="flat-spacing pt-0"
        offers={offers}
      />
    </>
  );
}

