"use client";
import { getBestItems } from "@/api/products";
import ProductCard1 from "@/components/productCards/ProductCard1";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/i18n/react";
import React from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Transform API response to match ProductCard1 expected format
const transformProduct = (apiProduct, t) => {
  // Transform API colors to component format
  const transformedColors =
    apiProduct.colors?.map((color) => ({
      id: `color-${color.id}`,
      name: color.color, // Using hex color as name for now
      value: color.color,
      bgColor: color.color, // Use the actual hex color
      imgSrc:
        color.image_path || apiProduct.image_path || "/images/placeholder.jpg",
      colorId: color.id,
    })) || [];

  // Transform API sizes to component format
  const transformedSizes =
    apiProduct.sizes?.map((size) => ({
      id: `size-${size.id}`,
      value: size.size.toUpperCase(),
      price: apiProduct.price, // Using base price for all sizes
      disabled: false,
      sizeId: size.id,
    })) || [];

  return {
    id: apiProduct.id,
    imgSrc: apiProduct.image_path || "/images/placeholder.jpg",
    imgHover: apiProduct.image_path || "/images/placeholder.jpg", // Using same image as hover since no hover image in API
    title: apiProduct.name || t("unnamedProduct"),
    price: apiProduct.price || 0,
    discount: apiProduct.discount || 0,
    salePercentage: apiProduct.discount || 0,
    isAvailable: apiProduct.is_available === 1,
    // Real API data for colors and sizes
    colors: transformedColors,
    sizes: transformedSizes,
    addToCart: t("addToCart"),
  };
};

export default function Products4({ parentClass = "" }) {
  const t = useTranslations("products");

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getBestItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle loading state
  if (isLoading) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("loading")}</span>
            </div>
            <p className="mt-2 text-secondary">{t("loadingProducts")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p className="text-danger">{t("errorTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Transform products and handle empty state
  const transformedProducts = products
    ? products.map((product) => transformProduct(product, t))
    : [];

  if (transformedProducts.length === 0) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p>{t("noProductsTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("topPicksTitle")}</h3>
          <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
        </div>
        <Swiper
          className="swiper tf-sw-latest"

          spaceBetween={15}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1200: { slidesPerView: 4, spaceBetween: 30 },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd5",
          }}
        >
          {transformedProducts.slice(0, 8).map((product, i) => (
            <SwiperSlide key={product.id} className="swiper-slide">
              <ProductCard1 product={product} />
            </SwiperSlide>
          ))}

          <div className="sw-pagination-latest spd5 sw-dots type-circle justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}
