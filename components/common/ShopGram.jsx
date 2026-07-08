"use client";
import { products2 } from "@/data/products";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { Pagination } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import { getImages } from "@/api/main";
import { useTranslations } from "@/i18n/react";

export default function ShopGram({ parentClass = "" }) {
  const t = useTranslations("shopgram");
  const {
    data: images,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["images"],
    queryFn: () => getImages(),
  });

  // Handle loading state
  if (isLoading) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading wow fadeInUp">{t("title")}</h3>
            <p className="subheading text-secondary wow fadeInUp">
              {t("subtitle")}
            </p>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("loading")}</span>
            </div>
            <p className="mt-2 text-secondary">{t("loading")}</p>
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
          <div className="heading-section text-center">
            <h3 className="heading wow fadeInUp">{t("title")}</h3>
            <p className="subheading text-secondary wow fadeInUp">
              {t("subtitle")}
            </p>
          </div>
          <div className="text-center py-5">
            <p className="text-danger">{t("error")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle empty state
  if (!images || images.length === 0) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading wow fadeInUp">{t("title")}</h3>
            <p className="subheading text-secondary wow fadeInUp">
              {t("subtitle")}
            </p>
          </div>
          <div className="text-center py-5">
            <p>{t("noImages")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="heading-section text-center">
          <h3 className="heading wow fadeInUp">{t("title")}</h3>
          <p className="subheading text-secondary wow fadeInUp">
            {t("subtitle")}
          </p>
        </div>
        <Swiper

          className="swiper tf-sw-shop-gallery"
          spaceBetween={10}
          breakpoints={{
            1200: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            0: { slidesPerView: 2 },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spb222",
          }}
        >
          {images?.slice(0, 5).map((item, i) => (
            <SwiperSlide key={i}>
              <div
                className="gallery-item hover-overlay hover-img wow fadeInUp"
                data-wow-delay={item.delay}
              >
                <div className="img-style">
                  <Image
                    className="lazyload img-hover"
                    data-src={item.image_path}
                    alt="image-gallery"
                    src={item.image_path}
                    width={640}
                    height={640}
                  />
                </div>
                {/* <Link
                  href={`/product-detail/${item.id}`}
                  className="box-icon hover-tooltip"
                >
                  <span className="icon icon-eye" />
                  <span className="tooltip">{t("viewProduct")}</span>
                </Link> */}
              </div>
            </SwiperSlide>
          ))}
          <div className="sw-pagination-gallery sw-dots type-circle justify-content-center spb222"></div>
        </Swiper>
      </div>
    </section>
  );
}
