"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import { Pagination } from "swiper/modules";
import { getSlider } from "@/api/slider";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n/react";

export default function Hero() {
  const locale = useLocale();
  const { data: sliders, isLoading } = useQuery({
    queryKey: ["slider"],
    queryFn: () => getSlider(),
  });

  if (isLoading) {
    return (
      <section className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </section>
    );
  }

  return (
    <section className="tf-slideshow slider-style2 slider-effect-fade">
      <Swiper

        spaceBetween={0}
        loop={true}
        autoplay={false}
        breakpoints={{
          1024: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          320: { slidesPerView: 1 },
        }}
        modules={[Pagination]}
        pagination={{
          clickable: true,
          el: ".spd30",
        }}
        className="swiper tf-sw-slideshow"
      >
        {sliders?.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="wrap-slider">
              <Image
                alt={slide?.title || ""}
                src={slide?.image_path || ""}
                width={1920}
                height={803}
              />
              <div className="box-content">
                <div className="container">
                  <div className="content-slider">
                    <div className="box-title-slider">
                      <div className="fade-item fade-item-1 heading title-display">
                        {slide?.title?.split("<br/>").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="fade-item fade-item-2 body-text-1">
                        {slide?.description}
                      </p>
                    </div>
                    <div className="fade-item fade-item-3 box-btn-slider">
                      <Link href={`/collections`} className="tf-btn btn-fill">
                        <span className="text">
                          {locale === "ar"
                            ? "استكشاف الأقسام"
                            : "Explore Collections"}
                        </span>
                        <i className="icon icon-arrowUpRight" />
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
          <div className="sw-dots sw-pagination-slider type-circle justify-content-center spd30" />
        </div>
      </div>
    </section>
  );
}
