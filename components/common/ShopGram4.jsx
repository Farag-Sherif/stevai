"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useTranslations } from "@/i18n/react";
import { useQuery } from "@tanstack/react-query";
import { getImages } from "@/api/main";

export default function ShopGram4() {
  const t = useTranslations("shopgram");
  const {
    data: images,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["images"],
    queryFn: () => getImages(),
  });

  if (isLoading) {
    return (
      <section>
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("title")}</h3>
          <p className="subheading text-secondary">{t("subtitle")}</p>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || !images) {
    return (
      <section>
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("title")}</h3>
          <p className="subheading text-secondary">{t("subtitle")}</p>
        </div>
        <div className="text-center py-5">
          <p className="text-muted">{t("error")}</p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section>
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("title")}</h3>
          <p className="subheading text-secondary">{t("subtitle")}</p>
        </div>
        <div className="text-center py-5">
          <p className="text-muted">{t("noImages")}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="heading-section text-center wow fadeInUp">
        <h3 className="heading">{t("title")}</h3>
        <p className="subheading text-secondary">{t("subtitle")}</p>
      </div>

      <Swiper
        spaceBetween={0}
        breakpoints={{
          1024: {
            slidesPerView: 6,
          },
          768: {
            slidesPerView: 4,
          },
          480: {
            slidesPerView: 3,
          },
          320: {
            slidesPerView: 2,
          },
        }}
        dir="ltr"
        className="swiper tf-sw-shop-gallery"
      >
        {images.map((item, index) => (
          <SwiperSlide key={item.id}>
            {item.url ? (
              <Link
                href={item.url}
                target="_blank"
                className="gallery-item rounded-0 hover-overlay hover-img wow fadeInUp cursor-pointer d-flex justify-content-center align-items-center"
                data-wow-delay={`${(index + 1) * 0.1}s`}
              >
                <div className="img-style text-center">
                  <Image
                    className="lazyload img-hover"
                    data-src={item.image_path}
                    alt={`Instagram image ${item.id}`}
                    src={item.image_path}
                    width={480}
                    height={480}
                  />
                </div>
              </Link>
            ) : (
              <div
                className="gallery-item rounded-0 hover-overlay hover-img wow fadeInUp d-flex justify-content-center align-items-center"
                data-wow-delay={`${(index + 1) * 0.1}s`}
              >
                <div className="img-style text-center">
                  <Image
                    className="lazyload img-hover"
                    data-src={item.image_path}
                    alt={`Instagram image ${item.id}`}
                    src={item.image_path}
                    width={480}
                    height={480}
                  />
                </div>
                {/* <Link
                href={`/product-detail/${item.id}`}
                className="box-icon hover-tooltip"
              >
                <span className="icon icon-eye"></span>
                <span className="tooltip">View Product</span>
              </Link> */}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
