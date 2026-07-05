"use client";

import React, { useState, useEffect } from "react";
import ProductsCards6 from "../productCards/ProductsCards6";
import Pagination from "../common/Pagination";

export default function Listview({
  products: productsData,
  pagination = true,
}) {
  const [products, setProducts] = useState(productsData);

  useEffect(() => {
    setProducts(productsData);
  }, [productsData]);

  return (
    <>
      {/* card product list 1 */}
      {products.map((product, index) => (
        <ProductsCards6
          product={product}
          key={`list-product-${product.id}-${index}`}
        />
      ))}
      {/* pagination */}
      {pagination ? (
        <ul className="wg-pagination ">
          <Pagination />
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
