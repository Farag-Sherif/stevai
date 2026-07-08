"use client";
import { product13 } from "@/data/products";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { Pagination } from "swiper/modules";
import { useLocale } from "@/i18n/react";

export default function ShopGram() {
  const locale = useLocale();
  return (
    <section>
      <div className="container-full3">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">Shop By Instagram</h3>
          <p className="subheading text-secondary">
            Elevate your wardrobe with fresh finds today!
          </p>
        </div>
        <Swiper

          className="swiper tf-sw-shop-gallery"
          spaceBetween={8}
          slidesPerView={7}
          breakpoints={{
            1400: {
              slidesPerView: 7,
            },
            1100: {
              slidesPerView: 5,
            },
            924: {
              slidesPerView: 4,
            },
            568: {
              slidesPerView: 3,
            },
            0: {
              slidesPerView: 2,
            },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd52",
          }}
        >
          {product13.map((item, index) => (
            <SwiperSlide className="swiper-slide" key={index}>
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
                    width={390}
                    height={390}
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

          <div className="sw-pagination-gallery sw-dots type-circle justify-content-center spd52" />
        </Swiper>
      </div>
    </section>
  );
}
