"use client";
import React, { useEffect, useState } from "react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useContextElement } from "@/context/Context";
import CountdownTimer from "../common/Countdown";
import { calcFinalPrice } from "@/utils/pricing";
import { useLocale } from "@/i18n/react";
import { getOutOfStockText, isProductInStock } from "@/utils/productStock";

export default function ProductCard3({ product }) {
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

  const isInStock = isProductInStock(product);
  const outOfStockText = getOutOfStockText(locale);
  const handleProductLinkClick = () => null;

  return (
    <div
      className={`card-product wow fadeInUp ${product.isOnSale ? "on-sale" : ""
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
                  className={`icon ${isAddedtoWishlist(product.id) ? "icon-heart-fill" : "icon-heart"
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
              <a
                href="#quickView"
                onClick={() => setQuickViewItem(product)}
                data-bs-toggle="modal"
                className="box-icon quickview tf-btn-loading"
              >
                <span className="icon icon-eye" />
                <span className="tooltip">Quick View</span>
              </a>
            </div>
            <div className="list-btn-main">
              <a
                href="#shoppingCart"
                data-bs-toggle="modal"
                className="btn-main-product"
                onClick={() => addProductToCart(product.id)}
              >
                {isAddedToCartProducts(product.id)
                  ? "Already Added"
                  : "ADD TO CART"}
              </a>
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
        <div className="box-rating">
          <ul className="list-star">
            {Array.from({ length: product.rating }).map((_, i) => (
              <li key={i} className="icon icon-star" />
            ))}
          </ul>
          <span className="text-caption-1 text-secondary"> (1.234) </span>
        </div>
        <span className="price">
          {product.oldPrice && (
            <span className="old-price">${product.oldPrice.toFixed(2)}</span>
          )}{" "}
          ${calcFinalPrice(product).finalPrice.toFixed(2)}
        </span>
        {product.weight && (
          <div className="product-weight mt-2">
            <span className="weight-label text-secondary-2">Weight: </span>
            <span className="weight-value">{product.weight}</span>
          </div>
        )}
        <div className="box-progress-stock">
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${product.progressBar}%` }}
              aria-valuenow={product.progressBar}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="stock-status d-flex justify-content-between align-items-center">
            <div className="stock-item text-caption-1">
              <span className="stock-label text-secondary-2"> Available: </span>
              <span className="stock-value">{product.available}</span>
            </div>
            <div className="stock-item text-caption-1">
              <span className="stock-label text-secondary-2"> Sold: </span>
              <span className="stock-value">{product.sold}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
