"use client";

import { products26 } from "@/data/products";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useLocale } from "@/i18n/react";

export default function ShopGram() {
  const locale = useLocale();
  return (
    <section>
      <div className="heading-section text-center">
        <h3 className="heading wow fadeInUp">Shop Instagram</h3>
        <p className="subheading text-secondary wow fadeInUp">
          Elevate your wardrobe with fresh finds today!
        </p>
      </div>
      <Swiper

        className="swiper tf-sw-shop-gallery"
        breakpoints={{
          1024: {
            slidesPerView: 6,
          },
          768: {
            slidesPerView: 4,
          },
          480: {
            slidesPerView: 2,
          },
        }}
        spaceBetween={10}
      >
        {products26.map((item, index) => (
          <SwiperSlide key={index} className="swiper-slide">
            <div
              className="gallery-item hover-overlay hover-img wow fadeInUp"
              data-wow-delay={item.wowDelay}
            >
              <div className="img-style">
                <Image
                  className="lazyload img-hover"
                  data-src={item.imgSrc}
                  alt={item.alt}
                  src={item.imgSrc}
                  width={466}
                  height={444}
                />
              </div>
              <Link
                href={`/product-detail/${item.id}`}
                className="box-icon hover-tooltip"
              >
                <span className="icon icon-eye" />
                <span className="tooltip">View Product</span>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
