"use client";
import { products3 } from "@/data/products";
import React, { useEffect, useState } from "react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useContextElement } from "@/context/Context";
import { calcFinalPrice } from "@/utils/pricing";
import { useLocale } from "@/i18n/react";
import { getOutOfStockText, isProductInStock } from "@/utils/productStock";

export default function ProductCard2({
  product = products3[0],
  addedClass = "",
}) {
  const locale = useLocale();
  const [currentImage, setCurrentImage] = useState(product.imgSrc);

  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  const isInStock = isProductInStock(product);
  const outOfStockText = getOutOfStockText(locale);
  const handleProductLinkClick = () => null;

  return (
    <div
      className={`card-product bundle-hover-item  ${addedClass} wow fadeInUp`}
      data-wow-delay={product.wowDelay}
    >
      <div className="card-product-wrapper">
        <Link
          href={`/product-detail/${product.id}`}
          className="product-img"
          onClick={handleProductLinkClick}
        >
          <Image
            className="lazyload img-product"
            data-src={product.imgSrc}
            src={currentImage}
            alt="image-product"
            width={351}
            height={468}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHover}
            src={product.imgHover}
            alt="image-product"
            width={600}
            height={800}
          />
        </Link>
        <div className="on-sale-wrap">
          <span className="on-sale-item">{product.saleText}</span>
        </div>
        <div className="list-btn-main">
          {isInStock ? (
            <a
              href="#quickView"
              onClick={() => setQuickViewItem(product)}
              data-bs-toggle="modal"
              className="btn-main-product"
            >
              Quick View
            </a>
          ) : (
            <span
              className="btn-main-product"
              role="status"
              aria-live="polite"
              style={{ cursor: "not-allowed", opacity: 0.7 }}
            >
              {outOfStockText}
            </span>
          )}
        </div>
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}`}
          className="title link"
          onClick={handleProductLinkClick}
        >
          {product.title}
        </Link>
        <span className="price">
          <span className="old-price">${product.oldPrice ? product.oldPrice.toFixed(2) : calcFinalPrice(product).originalPriceWithTax.toFixed(2)}</span>$
          {calcFinalPrice(product).finalPrice.toFixed(2)}
        </span>
        <ul className="list-color-product">
          {product.colors.map((color, idx) => (
            <li
              className={`list-color-item color-swatch ${currentImage == color.imgSrc ? "active" : ""
                }  ${color.bgColor == "bg-white" ? "line" : ""}`}
              onMouseOver={() => setCurrentImage(color.imgSrc)}
              key={idx}
            >
              <span className={`swatch-value ${color.bgColor}`} />
              <Image
                className="lazyload"
                data-src={color.imgSrc}
                src={color.imgSrc}
                alt="image-product"
                width={600}
                height={800}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
