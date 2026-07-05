"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n/react";
import { getSlidersProducts } from "@/api/slider";
import ProductCard1 from "@/components/productCards/ProductCard1";

export default function NewOffers({ parentClass = "flat-spacing" }) {
  const locale = useLocale();
  
  const {
    data: offersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["newOffers"],
    queryFn: getSlidersProducts,
  });

  const offers = offersData?.items || [];

  if (isLoading) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading wow fadeInUp">
              {locale === "ar" ? "أفضل العروض الجديدة" : "New Best Offers"}
            </h3>
            <p className="subheading text-secondary wow fadeInUp">
              {locale === "ar"
                ? "اكتشف أحدث العروض والخصومات الحصرية"
                : "Discover the latest exclusive offers and discounts"}
            </p>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !offers || offers.length === 0) {
    return null;
  }

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">
            {locale === "ar" ? "أفضل العروض الجديدة" : "New Best Offers"}
          </h3>
          <p className="subheading text-secondary">
            {locale === "ar"
              ? "اكتشف أحدث العروض والخصومات الحصرية"
              : "Discover the latest exclusive offers and discounts"}
          </p>
        </div>
        <div className="swiper-container position-relative">
          <Swiper
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="swiper tf-sw-latest"
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 15 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              992: { slidesPerView: 4, spaceBetween: 20 },
              1200: { slidesPerView: 4, spaceBetween: 30 },
            }}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: ".snbp-offers",
              nextEl: ".snbn-offers",
            }}
            pagination={{
              clickable: true,
              el: ".spd-offers",
            }}
          >
            {offers.map((offer) => (
              <SwiperSlide key={offer.id}>
                <ProductCard1 product={offer} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-navigation d-flex align-items-center justify-content-center gap-3 mt-4">
            <button
              className="swiper-button-prev snbp-offers"
              aria-label="Previous"
              style={{
                width: "40px",
                height: "40px",
                background: "var(--main, #029465)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <i className="icon icon-arrowLeft" />
            </button>
            <div className="sw-pagination-latest spd-offers sw-dots type-circle justify-content-center" />
            <button
              className="swiper-button-next snbn-offers"
              aria-label="Next"
              style={{
                width: "40px",
                height: "40px",
                background: "var(--main, #029465)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <i className="icon icon-arrowRight" />
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
          <Link href="/collections" className="btn-line">
            {locale === "ar" ? "عرض جميع العروض" : "View All Offers"}
          </Link>
        </div>
      </div>
    </section>
  );
}

