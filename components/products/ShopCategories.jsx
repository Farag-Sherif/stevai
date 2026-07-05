"use client";

import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories";

export default function ShopCategories() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
  return (
    <section className="flat-spacing">
      <div className="container">
        <Swiper
          dir="ltr"
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
          {categories?.map((collection, index) => (
            <SwiperSlide key={index}>
              <div className="collection-circle hover-img">
                <Link
                  href={`/collections/${collection.id}-${collection.name}`}
                  className="img-style"
                  prefetch={true}
                >
                  <Image
                    className="lazyload"
                    data-src={collection.logo_path || "/images/avatar/user-default.jpg"}
                    alt={collection.name}
                    src={collection.logo_path || "/images/avatar/user-default.jpg"}
                    width={363}
                    height={363}
                    loading="lazy"
                    fetchPriority="auto"
                    onError={(e) => {
                      e.target.src = "/images/avatar/user-default.jpg";
                    }}
                    unoptimized={collection.logo_path?.startsWith('http')}
                  />
                </Link>
                <div className="collection-content text-center">
                  <div>
                    <Link
                      href={`/collections/${collection.id}-${collection.name}`}
                      className="cls-title"
                      prefetch={true}
                    >
                      <h6 className="title-category">{collection.name}</h6>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                  {/* <div className="count text-secondary">{collection.count}</div> */}
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
