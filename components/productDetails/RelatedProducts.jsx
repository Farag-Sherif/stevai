"use client";
import React, { useState } from "react";
import Link from "@/router/Link";
import Image from "@/components/common/CompatImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { getTranslation, isRTL } from "@/utils/translations";
import { updateFavorites } from "@/api/products";
import { useContextElement } from "@/context/Context";
import { calcFinalPrice } from "@/utils/pricing";

export default function RelatedProducts({
  relatedProducts = [],
  locale = "en",
}) {
  const isRtl = isRTL(locale);
  const { addToWishlist, removeFromWishlist, isAddedtoWishlist, isWishlistActionInProgress } = useContextElement();

  const handleFavoriteToggle = (e, productId) => {
    e.preventDefault();
    if (isWishlistActionInProgress?.(productId)) return;
    if (isAddedtoWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  if (!relatedProducts || relatedProducts.length === 0) {
    return null; // Don't render if no related products
  }

  return (
    <section className="flat-spacing" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container flat-animate-tab">
        <ul
          className="tab-product justify-content-sm-center wow fadeInUp"
          data-wow-delay="0s"
          role="tablist"
        >
          <li className="nav-tab-item" role="presentation">
            <a href="#ralatedProducts" className="active" data-bs-toggle="tab">
              {getTranslation("relatedProducts", locale)}
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div
            className="tab-pane active show"
            id="ralatedProducts"
            role="tabpanel"
          >
            <Swiper
              className="swiper tf-sw-latest"
              dir={isRtl ? "rtl" : "ltr"}
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".spd4",
              }}
            >
              {relatedProducts.map((product) => (
                <SwiperSlide key={product.id} className="swiper-slide">
                  <div className="card-product">
                    <div className="card-product-wrapper">
                      <Link
                        href={`/product-detail/${product.id}-${product.name}`}
                        className="product-img"
                      >
                        <Image
                          className="lazyload img-product"
                          data-src={product.image_path}
                          alt={product.name}
                          src={product.image_path}
                          width={360}
                          height={360}
                        />
                        <Image
                          className="lazyload img-hover"
                          data-src={product.imgHover}
                          alt={product.name}
                          src={product.imgHover}
                          width={360}
                          height={360}
                        />
                      </Link>
                      <div className="list-product-btn absolute-2">
                        <a
                          href="#"
                          role="button"
                          className={`box-icon bg_white wishlist btn-icon-action ${isAddedtoWishlist(product.id) ? "active" : ""} ${isWishlistActionInProgress?.(product.id) ? "loading" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (isWishlistActionInProgress?.(product?.id)) return;
                            handleFavoriteToggle(e, product.id);
                          }}
                          style={{ pointerEvents: isWishlistActionInProgress?.(product?.id) ? "none" : undefined }}
                        >
                          {isWishlistActionInProgress?.(product?.id) ? (
                            <span className="spinner-border spinner-border-sm" style={{ width: "1em", height: "1em", borderWidth: "2px" }} role="status" aria-hidden="true" />
                          ) : (
                            <span className="icon icon-heart" />
                          )}
                          <span className="tooltip">
                            {isAddedtoWishlist(product.id)
                              ? getTranslation("removeFromWishlist", locale)
                              : getTranslation("wishlist", locale)}
                          </span>
                        </a>
                      </div>
                      {product.discount > 0 && (
                        <div className="on-sale-wrap text-end">
                          <div className="on-sale-item">
                            {locale === "ar"
                              ? `${product.discount}%`
                              : `-${product.discount}%`}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-product-info">
                      <Link
                        href={`/product-detail/${product.id}-${product.name}`}
                        className="title link"
                      >
                        {product.name}
                      </Link>
                      {product.weight && (
                        <div className="product-weight text-caption-2">
                          {locale === "ar" ? "الوزن:" : "Weight:"}{" "}
                          {product.weight}
                        </div>
                      )}
                      <span className="price">
                        {(() => {
                          const pricing = calcFinalPrice(product);
                          return (
                            <>
                              {pricing.hasDiscount && (
                                <span className="old-price">
                                  {locale === "ar"
                                    ? `ج.م ${pricing.originalPriceWithTax.toFixed(2)}`
                                    : `EGP ${pricing.originalPriceWithTax.toFixed(2)}`}
                                </span>
                              )}{" "}
                              {locale === "ar"
                                ? `ج.م ${pricing.finalPrice.toFixed(2)}`
                                : `EGP ${pricing.finalPrice.toFixed(2)}`}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              <div className="sw-pagination-latest spd4 sw-dots type-circle justify-content-center" />
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
