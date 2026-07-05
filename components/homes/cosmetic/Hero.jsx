"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { useLocale } from "@/i18n/react";
import { useQuery } from "@tanstack/react-query";
import { getSlider } from "@/api/slider";
import "@/styles/hero-slider.css";
import "@/styles/hero-navigation.css";

export default function Hero() {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const { data: sliders, isLoading } = useQuery({
    queryKey: ["slider"],
    queryFn: () => getSlider(),
    staleTime: 10 * 60 * 1000, // 10 minutes - sliders don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Instant UI with cached data
  });

  const sliderItems = Array.isArray(sliders)
    ? sliders.filter((item) => item?.image_path)
    : [];

  // Only show loading if no cached data - instant UI
  if (isLoading && !sliders) {
    return (
      <div className="tf-slideshow slider-style2 slider-effect-fade">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "796px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!sliderItems || sliderItems.length === 0) {
    return (
      <div className="tf-slideshow slider-style2 slider-effect-fade">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "420px" }}
        >
          <p style={{ color: "#555", fontWeight: 600 }}>
            {locale === "ar"
              ? "لا توجد شرائح مفعلة حالياً"
              : "No active slides available."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-slideshow slider-style2 slider-effect-fade">
      <Swiper
        dir={isRtl ? "rtl" : "ltr"}
        centeredSlides={false}
        spaceBetween={0}
        loop={true}
        allowTouchMove={sliderItems.length > 1}
        autoplay={
          sliderItems.length > 1
            ? {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        navigation={true}
        breakpoints={{
          1024: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 1,
          },
          0: {
            slidesPerView: 1,
          },
        }}
        className="swiper tf-sw-slideshow"
        modules={[Pagination, Autoplay, Navigation]}
        pagination={{
          clickable: true,
          el: ".spd18",
        }}
      >
        {sliderItems.map((slider, index) => (
          <SwiperSlide key={slider.id}>
            <div className="wrap-slider">
              <Image
                alt={`slider-${slider.id}`}
                src={slider.image_path}
                width={1920}
                height={796}
                className="hero-slider-image"
                priority={index === 0} // Priority loading for first slide only
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="box-content">
                <div className="container">
                  <div className="content-slider">
                    <div className="box-title-slider">
                      <div className="fade-item fade-item-1 heading title-display text-white">
                        {slider.title}
                      </div>
                      <p className="fade-item fade-item-2 body-text-1 text-white">
                        {slider.description}
                      </p>
                    </div>
                    <div className="fade-item fade-item-3 box-btn-slider">
                      <Link
                        href={`/shop`}
                        className="tf-btn btn-fill btn-square btn-white"
                        prefetch={true}
                      >
                        <span className="text">
                          {locale === "ar" ? "تسوق الآن" : "Shop Now"}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider type-circle white-circle-line justify-content-center spd18" />
        </div>
      </div>
    </div>
  );
}
