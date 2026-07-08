"use client";

import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import { getBrandCategories } from "@/api/categories";

export default function BrandCategories() {
  const { data: brandCategories } = useQuery({
    queryKey: ["brandCategories"],
    queryFn: getBrandCategories,
  });

  return (
    <section className="flat-spacing">
      <div className="container">
        <Swiper

          slidesPerView={5}
          spaceBetween={20}
          breakpoints={{
            1200: { slidesPerView: 6, spaceBetween: 20 },
            1000: { slidesPerView: 4, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            480: { slidesPerView: 2, spaceBetween: 15 },
            0: { slidesPerView: 2, spaceBetween: 15 },
          }}
          modules={[Pagination, Navigation]}
          pagination={{
            clickable: true,
            el: ".spd54",
          }}
          navigation={{
            prevEl: ".snbp12",
            nextEl: ".snbn12",
          }}
        >
          {brandCategories?.map((brand, index) => (
            <SwiperSlide key={index}>
              <div className="collection-circle hover-img">
                <Link
                  href={`/collections/${brand.id}-${brand.name}`}
                  className="img-style"
                >
                  <Image
                    className="lazyload"
                    data-src={brand.logo_path}
                    alt={brand.name}
                    src={brand.logo_path}
                    width={363}
                    height={363}
                  />
                </Link>
                <div className="collection-content text-center">
                  <div>
                    <Link
                      href={`/collections/${brand.id}-${brand.name}`}
                      className="cls-title"
                    >
                      <h6 className="title-category">{brand.name}</h6>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                  {/* <div className="count text-secondary">{brand.count}</div> */}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd54" />
      </div>
    </section>
  );
}
