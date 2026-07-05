import React from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";

export default function GridView({
  products,
  pagination = true,
  paginationInfo = null,
  currentPage = 1,
  onPageChange = null,
}) {
  return (
    <>
      {products.length > 0 &&products?.map((product, index) => (
        <ProductCard1
          key={`grid-product-${product.id}-${currentPage}-${index}`}
          product={product}
          gridClass="grid"
        />
      ))}
      {/* pagination */}
      {pagination && (
        <ul className="wg-pagination justify-content-center">
          <Pagination
            paginationInfo={paginationInfo}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </ul>
      )}
    </>
  );
}
