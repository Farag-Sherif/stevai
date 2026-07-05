"use client";

import ProductCard1 from "@/components/productCards/ProductCard1";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations, useLocale } from "@/i18n/react";
import { useQuery } from "@tanstack/react-query";
import { getBestItems } from "@/api/products";
import { stripHtml } from "@/utils/stripHtml";

// مهم لو مش محطوط عندك في global.css
// import "swiper/css";
// import "swiper/css/pagination";

const transformApiProduct = (apiProduct, currentLocale = "en") => {
  const translation =
    apiProduct.translations?.find((t) => t.locale === currentLocale) ||
    apiProduct.translations?.[0];

  return {
    id: apiProduct.id,
    title: translation?.name || apiProduct.name,
    imgSrc: apiProduct.image_path,
    imgHover:
      apiProduct.media?.[1]?.image_path ||
      apiProduct.media?.[0]?.image_path ||
      apiProduct.image_path,
    price: apiProduct.price,
    total: apiProduct.total,
    added_value: apiProduct.added_value,
    media: apiProduct.media,
    image_path: apiProduct.image_path,
    name: translation?.name || apiProduct.name,
    oldPrice:
      apiProduct.discount > 0
        ? Math.round(apiProduct.price / (1 - apiProduct.discount / 100))
        : null,
    isOnSale: apiProduct.discount > 0,
    discount: apiProduct.discount,
    inStock: apiProduct.is_available === 1,
    weight: translation?.weight || apiProduct.weight || "",
    category: apiProduct.category,
    description: stripHtml(translation?.description || apiProduct.description || ""),
  };
};

export default function Products5() {
  const t = useTranslations("products");
  const locale = useLocale(); // "ar" / "en" ...

  const { data, isLoading, error } = useQuery({
    queryKey: ["bestItems", locale], // Use unique key for best items
    queryFn: getBestItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Instant UI with cached data
  });

  // ✅ طَبّع الداتا لأي شكل راجع من الـ API
  const rawItems =
    data?.data ||               // لو API بيرجع {data: [...]}
    data?.details?.data ||      // لو بيرجع {details:{data:[...]}}
    (Array.isArray(data) ? data : data ? Object.values(data) : []);

  const products = rawItems.map((p) => transformApiProduct(p, locale));

  // Only show loading if no cached data available - instant UI
  if (isLoading && !data) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("loading")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p className="text-danger">{t("errorTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length && !isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">{t("topPicksTitle")}</h3>
            <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
          </div>
          <div className="text-center py-5">
            <p>{t("noProductsTitle")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">{t("topPicksTitle")}</h3>
          <p className="subheading text-secondary">{t("topPicksSubtitle")}</p>
        </div>

        <Swiper
          className="swiper tf-sw-latest"
          dir={locale === "ar" ? "rtl" : "ltr"}
          spaceBetween={15}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1200: { slidesPerView: 4, spaceBetween: 30 },
          }}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spd6" }}
          onBeforeInit={(swiper) => {
            swiper.params.pagination.el = ".spd6";
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard1 product={product} />
            </SwiperSlide>
          ))}

          {/* ✅ خلي pagination في slot مخصوص */}
          <div
            slot="container-end"
            className="sw-pagination-latest spd6 sw-dots type-circle justify-content-center"
          />
        </Swiper>
      </div>
    </section>
  );
}
