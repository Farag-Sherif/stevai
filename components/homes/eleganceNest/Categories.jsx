"use client";
import Image from "@/components/common/CompatImage";
import { collections2 } from "@/data/collections";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "@/router/Link";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories";
import { useTranslations, useLocale } from "@/i18n/react";

export default function Categories() {
  const t = useTranslations("categories");
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            <p>{t("loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            <p>{t("error")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            <p>{t("noCategories")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section-2 wow fadeInUp">
          <h3 className="heading">{t("title")}</h3>
          <Link href={`/collections`} className="btn-line">
            {t("viewAll")}
          </Link>
        </div>
      </div>
      <div
        className="container-full slider-layout-right wow fadeInUp"
        data-wow-delay="0.1s"
      >
        <Swiper

          spaceBetween={15}
          breakpoints={{
            0: { slidesPerView: 2.2, spaceBetween: 15 },
            568: { slidesPerView: 3.2, spaceBetween: 20 },
            968: { slidesPerView: 4.2, spaceBetween: 20 },
            1224: { slidesPerView: 6.2, spaceBetween: 20 },
          }}
          pagination={{
            clickable: true,
            clickable: true,
          }}
        >
          {categories?.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="collection-position-2 hover-img">
                <a className="img-style">
                  <Image
                    className="lazyload"
                    data-src={slide?.logo_path}
                    alt={slide?.name}
                    src={slide?.logo_path}
                    width={363}
                    height={483}
                  />
                </a>
                <div className="content">
                  <Link
                    href={`/collections/${slide?.id}-${slide?.name}`}
                    className="cls-btn"
                  >
                    <h6 className="title-category">{slide?.name}</h6>
                    <i className="icon icon-arrowUpRight" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
