"use client";

import React, { useState } from "react";
import SubCategoriesFilter from "./SubCategoriesFilter";
import Products from "./Products";

export default function ShopProducts({ 
  offers = false 
}) {
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);

  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategoryId(subCategoryId);
  };

  return (
    <>
      <SubCategoriesFilter
        categoryId={null}
        currentSubCategoryId={selectedSubCategoryId}
        onSubCategoryChange={handleSubCategoryChange}
        showAllButton={true}
        allButtonHref="/shop"
      />
      <Products
        subCategoryId={selectedSubCategoryId}
        categoryId={null}
        order={1}
        parentClass="flat-spacing pt-0"
        offers={offers}
      />
    </>
  );
}

