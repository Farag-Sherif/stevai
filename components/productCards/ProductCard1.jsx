"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "@/components/common/CompatImage";
import { Link, useRouter } from "@/i18n/navigation";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { useQueryClient } from "@tanstack/react-query";
import { getProduct } from "@/api/products";
import { useUserStore } from "@/store/userStore";
import { useLocale } from "@/i18n/react";
import { calcFinalPrice } from "@/utils/pricing";
import { getOutOfStockText, isProductInStock } from "@/utils/productStock";

const ProductCard1 = React.memo(function ProductCard1({
  product: productData,
  gridClass = "",
  parentClass = "card-product wow fadeInUp",
  isNotImageRatio = false,
  radiusClass = "",
  wishList,
  search = false,
}) {
  const locale = useLocale();
  const [product, setProduct] = useState(productData);
  console.log(product)
  const [currentImage, setCurrentImage] = useState(wishList ? productData.image_path : productData.imgSrc);
  const [imageError, setImageError] = useState(false);
  const [hoverImageError, setHoverImageError] = useState(false);

  // Hover image state - will be set in useEffect from media or imgHover
  const [hoverImage, setHoverImage] = useState(null);

  useEffect(() => {
    setProduct(productData);
    setCurrentImage(wishList ? productData.image_path : productData.imgSrc);
    setImageError(false);
    setHoverImageError(false);

    // Update hover image from media if available
    const newHoverImage = wishList && productData.media && productData.media.length > 0
      ? productData.media[0].image_path
      : productData.imgHover;
    setHoverImage(newHoverImage);
  }, [productData, wishList]);

  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const router = useRouter();

  const {
    setQuickAddItem,
    addProductToCart,
    isAddedToCartProducts,
    addToWishlist,
    removeFromWishlist,
    isAddedtoWishlist,
    isWishlistActionInProgress,
  } = useContextElement();

  // Price: apply discount first, then apply added_value% (VAT) on the discounted price
  const calculatePrices = (p) => {
    const pricing = calcFinalPrice(p);
    return {
      currentPrice: pricing.finalPrice,
      originalPriceWithAdded: pricing.originalPriceWithTax,
      hasDiscount: pricing.hasDiscount,
    };
  };

  // Get calculated prices
  const { currentPrice, originalPriceWithAdded, hasDiscount } =
    calculatePrices(product);

  const slugTitle =
    (product?.title || product?.name || "")
      .toString()
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || product?.id;
  
  const productDetailHref = `/product-detail/${product?.id}-${slugTitle}`;
  const isInStock = isProductInStock(product);
  const outOfStockText = getOutOfStockText(locale);
  const handleProductLinkClick = () => null;

  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isWishlistActionInProgress?.(product?.id)) return;
    if (isAddedtoWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Handle quick add to cart
  const handleQuickAddToCart = () => {
    const pricing = calcFinalPrice(product);

    // Create a complete product object for the cart
    const productForCart = {
      id: product.id,
      name: product.name || product.title,
      title: product.title || product.name,
      image_path: product.image_path || product.imgSrc,
      imgSrc: product.imgSrc || product.image_path,
      price: pricing.finalPrice,
      oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
      originalPrice: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      // Carry tax info for checkout breakdown
      added_value: Number(product.added_value ?? product.addedValuePercent) || 0,
      // Base after discount, before added value (used for VAT breakdown)
      originalBasePrice: pricing.afterDiscount,
      // If provided, checkout will use this for exact VAT calculation
      taxAmount: typeof pricing.taxAmount === "number" ? pricing.taxAmount : undefined,
      category: product.category,
      weight: product.weight,
      cartId: `${product.id}`,
    };

    addProductToCart(productForCart);
  };

  // Handle add to cart - directly add without confirmation
  const handleAddToCart = () => {
    const pricing = calcFinalPrice(product);

    // Create a complete product object for the cart
    const productForCart = {
      id: product.id,
      name: product.name || product.title,
      title: product.title || product.name,
      image_path: product.image_path || product.imgSrc,
      imgSrc: product.imgSrc || product.image_path,
      price: pricing.finalPrice,
      oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
      originalPrice: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      // Carry tax info for checkout breakdown
      added_value: Number(product.added_value ?? product.addedValuePercent) || 0,
      // Base after discount, before added value (used for VAT breakdown)
      originalBasePrice: pricing.afterDiscount,
      // If provided, checkout will use this for exact VAT calculation
      taxAmount: typeof pricing.taxAmount === "number" ? pricing.taxAmount : undefined,
      category: product.category,
      weight: product.weight,
      cartId: `${product.id}`,
    };

    addProductToCart(productForCart);
  };

  // Prefetch product detail on hover for instant navigation
  const handleMouseEnter = useCallback(() => {
    if (!isInStock) return;
    router.prefetch(productDetailHref);
    // Prefetch product data for instant load
    queryClient.prefetchQuery({
      queryKey: ["product", product.id],
      queryFn: () => getProduct(product.id),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  }, [router, queryClient, product.id, product.title, productDetailHref, isInStock]);

  return (
    <div
      className={`${parentClass} ${gridClass} ${product?.isOnSale ? "on-sale" : ""
        }`}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={`card-product-wrapper ${isNotImageRatio ? "aspect-ratio-0" : ""
          } ${radiusClass} `}
        style={search ? { pointerEvents: 'none' } : {}}
      >
        <Link
          href={productDetailHref}
          className="product-img"
          prefetch={isInStock}
          onClick={handleProductLinkClick}
          style={search ? { pointerEvents: 'auto' } : {}}
        >
          {currentImage && currentImage.trim() !== "" && !imageError ? (
            <Image
              className="lazyload img-product"
              src={currentImage}
              alt={'img'}
              width={600}
              height={800}
              loading="lazy"
              fetchPriority="auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={() => setImageError(true)}
              style={search ? { pointerEvents: 'none',opacity: 1 } : {}}
              unoptimized={
                typeof currentImage === "string" &&
                (currentImage.startsWith("http://") ||
                  currentImage.startsWith("https://"))
              }
            />
          ) : imageError ? (
            <div
              className="lazyload img-product image-error-placeholder"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                color: "#999",
                fontSize: "14px",
              }}
            >
              {product.title}
            </div>
          ) : null}

          {!search &&
            hoverImage &&
            hoverImage.trim() !== "" &&
            !hoverImageError &&
            !imageError && (
              <Image
                className="lazyload img-hover"
                src={hoverImage}
                alt={product.title}
                width={600}
                height={800}
                loading="lazy"
                fetchPriority="auto"
                onError={() => setHoverImageError(true)}
                unoptimized={
                  typeof hoverImage === "string" &&
                  (hoverImage.startsWith("http://") ||
                    hoverImage.startsWith("https://"))
                }
              />
            )}
        </Link>

        {/* Hot Sale Banner */}
        {product?.hotSale && (
          <div className="marquee-product bg-main">
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
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
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    {locale === "ar"
                      ? `عرض ساخن خصم ${product?.salePercentage}%`
                      : `Hot Sale ${product?.salePercentage}% OFF`}
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sale Badge */}
        {product?.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">
              {locale === "ar"
                ? `${product?.discount}%`
                : `${product?.discount}%`}
            </span>
          </div>
        )}

        {/* Countdown */}
        {product?.countdown && (
          <div className="variant-wrap countdown-wrap">
            <div className="variant-box">
              <div
                className="js-countdown"
                data-timer={product?.countdown}
                data-labels="D :,H :,M :,S"
              >
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}

        {isInStock ? (
          <>
            <div className="list-product-btn" style={search ? { pointerEvents: "auto" } : undefined}>
          <a
            onClick={handleFavoriteToggle}
            className={`box-icon wishlist btn-icon-action ${isAddedtoWishlist(product?.id) ? "active" : ""} ${isWishlistActionInProgress?.(product?.id) ? "loading" : ""}`}
            role="button"
            tabIndex={0}
            aria-busy={isWishlistActionInProgress?.(product?.id)}
            style={{ pointerEvents: isWishlistActionInProgress?.(product?.id) ? "none" : undefined }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFavoriteToggle(e);
              }
            }}
          >
            {isWishlistActionInProgress?.(product?.id) ? (
              <span className="spinner-border spinner-border-sm" style={{ width: "1em", height: "1em", borderWidth: "2px" }} role="status" aria-hidden="true" />
            ) : (
              <span className="icon icon-heart" />
            )}
            <span className="tooltip">
              {isAddedtoWishlist(product?.id)
                ? locale === "ar"
                  ? "إزالة من المفضلة"
                  : "Remove from Favorites"
                : locale === "ar"
                  ? "أضف إلى المفضلة"
                  : "Add to Favorites"}
            </span>
          </a>
        </div>

        <div className="list-btn-main" style={search ? { pointerEvents: "auto" } : undefined}>
          <a
            className="btn-main-product"
            onClick={handleAddToCart}
            role="button"
            aria-label={
              isAddedToCartProducts(product?.id)
                ? locale === "ar"
                  ? "تم الإضافة بالفعل"
                  : "Already Added"
                : locale === "ar"
                  ? `أضف ${product.title} إلى السلة`
                  : `Add ${product.title} to Cart`
            }
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAddToCart();
              }
            }}
          >
            {isAddedToCartProducts(product?.id)
              ? locale === "ar"
                ? "تم الإضافة بالفعل"
                : "Already Added"
              : locale === "ar"
                ? "أضف إلى السلة"
                : "ADD TO CART"}
          </a>
            </div>
          </>
        ) : (
          <div className="list-btn-main" style={search ? { pointerEvents: "auto" } : undefined}>
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
   

      <div className="card-product-info">
        <Link
          href={productDetailHref}
          className="title link"
          prefetch={isInStock}
          onClick={handleProductLinkClick}
        >
          {product.title}
        </Link>

        <span className="price">
          {hasDiscount && (
            <span className="old-price">
              {locale === "ar"
                ? `ج.م ${originalPriceWithAdded.toFixed(2)}`
                : `EGP ${originalPriceWithAdded.toFixed(2)}`}
            </span>
          )}{" "}
          {locale === "ar"
            ? `ج.م ${currentPrice?.toFixed(2)}`
            : `EGP ${currentPrice?.toFixed(2)}`}
        </span>
        {product?.weight && (
          <div className="product-weight">
            <span className="weight-label">
              {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
            </span>
            <span className="weight-value">{product.weight}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .old-price {
          text-decoration: line-through;
          color: #999;
          margin-right: 8px;
        }

        .product-weight {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #666;
        }

        .weight-label {
          font-weight: 500;
        }

        .weight-value {
          font-weight: 400;
          color: #333;
        }
      `}</style>
    </div>
    </div>
  );
});

export default ProductCard1;
