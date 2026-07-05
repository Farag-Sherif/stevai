"use client";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLocale } from "@/i18n/react";
import { getChoices } from "@/api/main";
import { useQuery } from "@tanstack/react-query";

export default function Features({ parentClass = "flat-spacing" }) {
  const locale = useLocale();

  const {
    data: choices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["choices"],
    queryFn: getChoices,
  });

  // Transform API data to component format
  const iconboxItems =
    choices?.map((choice) => {
      const translation =
        choice.translations?.find((t) => t.locale === locale) ||
        choice.translations?.[0];
      return {
        id: choice.id,
        icon: choice.icon_path,
        title: translation?.title || choice.title,
        description: translation?.description || choice.description,
      };
    }) || [];
  if (isLoading) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  if (error || !choices?.length) {
    return null;
  }

  const isRtl = locale === "ar";

  return (
    <section className={`${parentClass} ${isRtl ? "features-rtl" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="container">
        <Swiper
          dir={isRtl ? "rtl" : "ltr"}
          className="swiper tf-sw-iconbox"
          spaceBetween={15}
          breakpoints={{
            1200: { slidesPerView: 4 },
            768: { slidesPerView: 3 },
            576: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd2",
          }}
        >
          {iconboxItems.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="tf-icon-box">
                <div className="icon-box">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="icon"
                    style={{ width: "40px", height: "40px" }}
                  />
                </div>
                <div className={`content text-center ${isRtl ? "text-end" : ""}`}>
                  <h6>{item.title}</h6>
                  <p className="text-secondary">{item.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="sw-pagination-iconbox spd2 sw-dots type-circle justify-content-center" />
        </Swiper>
      </div>
    </section>
  );
}
