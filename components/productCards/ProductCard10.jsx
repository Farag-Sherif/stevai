"use client";
import React, { useEffect, useState } from "react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { calcFinalPrice } from "@/utils/pricing";
import { useLocale } from "@/i18n/react";
import { getOutOfStockText, isProductInStock } from "@/utils/productStock";

export default function ProductCard10({ product, gridClass = "" }) {
  const locale = useLocale();
  const [currentImage, setCurrentImage] = useState(product.imgSrc);

  const {
    setQuickAddItem,
    addToWishlist,
    removeFromWishlist,
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


  const pricing = calcFinalPrice(product);
  const isInStock = isProductInStock(product);
  const outOfStockText = getOutOfStockText(locale);
  const handleProductLinkClick = () => null;

  return (
    <div
      className={`card-product style-5 wow fadeInUp ${gridClass} ${product.isOnSale ? "on-sale" : ""
        } ${product.sizes ? "card-product-size" : ""}`}
    >
      <div className="card-product-wrapper">
        <Link
          href={`/product-detail/${product.id}`}
          className="product-img"
          onClick={handleProductLinkClick}
        >
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt={product.title}
            width={600}
            height={800}
          />

          <Image
            className="lazyload img-hover"
            src={product.imgHover}
            alt={product.title}
            width={600}
            height={800}
          />
        </Link>
        {product.hotSale && (
          <div className="marquee-product bg-main">
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
          </div>
        )}
        {product.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-{product.salePercentage}</span>
          </div>
        )}

        {product.countdown && (
          <div className="variant-wrap countdown-wrap">
            <div className="variant-box">
              <div
                className="js-countdown"
                data-timer={product.countdown}
                data-labels="D :,H :,M :,S"
              >
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}
        {product.oldPrice ? (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-25%</span>
          </div>
        ) : (
          ""
        )}
        {isInStock ? (
          <>
            <div className="list-product-btn">
              <a
                onClick={() =>
                  isAddedtoWishlist(product.id)
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product.id)
                }
                className={`box-icon wishlist btn-icon-action ${isAddedtoWishlist(product.id) ? "active" : ""
                  }`}
              >
                <span
                  className={`icon ${isAddedtoWishlist(product.id)
                    ? "icon-heart"
                    : "icon-heart"
                    }`}
                />
                <span className="tooltip">
                  {isAddedtoWishlist(product.id)
                    ? "Already Wishlished"
                    : "Wishlist"}
                </span>
              </a>
              <a
                href="#compare"
                data-bs-toggle="offcanvas"
                aria-controls="compare"
                onClick={() => addToCompareItem(product.id)}
                className="box-icon compare btn-icon-action"
              >
                <span className="icon icon-gitDiff" />
                <span className="tooltip">
                  {" "}
                  {isAddedtoCompareItem(product.id)
                    ? "Already compared"
                    : "Compare"}
                </span>
              </a>
            </div>
            <div className="list-btn-main">
              <div className="list-btn-main">
                <a
                  href="#quickView"
                  data-bs-toggle="modal"
                  onClick={() => setQuickViewItem(product)}
                  className="quick-view btn-main-product"
                >
                  Quick View
                </a>
                <a
                  href="#quickAdd"
                  onClick={() => setQuickAddItem(product.id)}
                  data-bs-toggle="modal"
                  className="btn-main-product"
                >
                  Quick Add
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="list-btn-main">
            <span
              className="btn-main-product"
              role="status"
              aria-live="polite"
              style={{ cursor: "not-allowed", opacity: 0.7 }}
            >
              {outOfStockText}
            </span>
          </div>
        )}
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
          {product.oldPrice && (
            <span className="old-price">${product.oldPrice.toFixed(2)}</span>
          )}{" "}
          ${pricing.finalPrice.toFixed(2)}
        </span>
        {product.weight && (
          <div className="product-weight mt-2">
            <span className="weight-label text-secondary-2">Weight: </span>
            <span className="weight-value">{product.weight}</span>
          </div>
        )}
      </div>
    </div>
  );
}
