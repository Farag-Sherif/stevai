"use client";
import Image from "@/components/common/CompatImage";
import React, { useEffect } from "react";
import Link from "@/router/Link";
import { useLocale } from "@/i18n/react";
import { getSlidersProducts } from "@/api/slider";
import { useQuery } from "@tanstack/react-query";
import { calcFinalPrice } from "@/utils/pricing";

export default function BannerTab2({ parentClass = "flat-spacing pt-0" }) {
  const { data } = useQuery({
    queryKey: ["products37"],
    queryFn: getSlidersProducts,
  });
  const locale = useLocale();

  // Normalize items from /product-section: sometimes price can be a number, sometimes an array like [{price: ...}]
  const getPricingForItem = (item) => {
    const isArrayPrice = Array.isArray(item?.price);
    const basePrice = isArrayPrice ? item?.price?.[0]?.price : item?.price;
    const total = item?.total ?? (isArrayPrice ? item?.price?.[0]?.total : undefined);
    const added_value =
      item?.added_value ?? (isArrayPrice ? item?.price?.[0]?.added_value : undefined);
    const discount = item?.discount ?? (isArrayPrice ? item?.price?.[0]?.discount : undefined);

    return calcFinalPrice({
      ...item,
      price: basePrice,
      total,
      added_value,
      discount,
    });
  };

  // Use API data if available, fallback to static data
  const bannerData = data || {
    title: "Ready to Glow?",
    content: "",
    items: [],
  };
  const translation = bannerData.translations?.find((t) => t.locale === locale) || bannerData.translations?.[0];
  const title = translation?.title || bannerData.title;
  const content = translation?.content || bannerData.content;
  const displayItems = bannerData.items || [];
  useEffect(() => {
    const offsetX = 20;
    const offsetY = 20;

    const handleMouseMove = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.top = `${e.clientY + offsetY}px`;
        hoverImage.style.left = `${e.clientX + offsetX}px`;
      }
    };

    const handleMouseEnter = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.display = "block";
        hoverImage.style.transform = "scale(1)";
        hoverImage.style.opacity = "1";
      }
    };

    const handleMouseLeave = (e) => {
      const hoverImage = e.currentTarget.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.transform = "scale(0)";
        hoverImage.style.opacity = "0";
        // Add a small delay before hiding to allow smooth transition
        setTimeout(() => {
          if (hoverImage.style.opacity === "0") {
            hoverImage.style.display = "none";
          }
        }, 300); // Match the CSS transition duration
      }
    };

    const elements = document.querySelectorAll(".hover-cursor-img");

    // Initialize hover images with proper initial state
    elements.forEach((el) => {
      const hoverImage = el.querySelector(".hover-image");
      if (hoverImage) {
        hoverImage.style.position = "fixed";
        hoverImage.style.transform = "scale(0)";
        hoverImage.style.opacity = "0";
        hoverImage.style.display = "none";
        hoverImage.style.pointerEvents = "none";
        hoverImage.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        hoverImage.style.zIndex = "1000";
      }

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [displayItems]);
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="row flat-img-with-text-v2">
          <div className="col-lg-7 col-md-6">
            <div className="banner-left">
              <div className="box-title wow fadeInUp">
                <h3>
                  {title}
                  <br className="d-none d-lg-block" />
                </h3>
                <p>{content}</p>
              </div>
              <ul className="tab-banner" role="tablist">
                {displayItems?.map((item, index) => (
                  <li
                    key={item.id}
                    className={`nav-tab-item wow fadeInUp`}
                    data-wow-delay={item.delay || `${index * 0.1}s`}
                    role="presentation"
                  >
                    <a
                      href={`#tabBannerCls${item.id}`}
                      className={`nav-tab-link hover-cursor-img ${
                        item.active || index === 0 ? "active" : ""
                      }`}
                      data-bs-toggle="tab"
                    >
                      <h5 className="title text-line-clamp-1">
                        {(() => {
                          const itemTranslation = item.translations?.find((t) => t.locale === locale) || item.translations?.[0];
                          return itemTranslation?.name || itemTranslation?.title || item.name || item.title || `Product ${item.id}`;
                        })()}
                      </h5>
                      <div className="arr-link">
                        <span className="text-btn-uppercase text-more">
                          More
                        </span>
                        <i className="icon icon-arrowUpRight" />
                      </div>
                      <div className="hover-image">
                        <Image
                          alt="Hover Image"
                          src={
                            item.image_path ||
                            item.image ||
                            "/images/products/default.jpg"
                          }
                          width={710}
                          height={945}
                        />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="wow fadeInUp">
                <Link href={`/collections`} className="btn-line">
                  {locale === "ar" ? "عرض الكل" : "View All Collection"}
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-5 col-md-6">
            <div className="banner-right flat-animate-tab">
              <div className="tab-content">
                {displayItems.map((item, index) => {
                  const pricing = getPricingForItem(item);
                  const discount = Number(item?.discount ?? (Array.isArray(item?.price) ? item?.price?.[0]?.discount : undefined)) || 0;

                  return (
                  <div
                    key={item.id}
                    className={`tab-pane ${
                      item.active || index === 0 ? "active show" : ""
                    }`}
                    id={`tabBannerCls${item.id}`}
                    role="tabpanel"
                  >
                    <div className="collection-position-2 hover-img">
                      <Link
                        href={`/product-detail/${item?.id}`}
                        className="img-style"
                      >
                        <Image
                          className="lazyload"
                          data-src={
                            item?.image_path ||
                            item?.image ||
                            "/images/products/default.jpg"
                          }
                          alt="banner-cls"
                          src={
                            item?.image_path ||
                            item?.image ||
                            "/images/products/default.jpg"
                          }
                          width={710}
                          height={945}
                        />
                        {discount > 0 && (
                          <div className="on-sale-wrap">
                            <span className="on-sale-item">
                              {discount}%
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="content cls-content">
                        <div className="cls-info">
                          <Link
                            href={`/product-detail/${item?.id}`}
                            className="text-title link text-line-clamp-1"
                          >
                            {(() => {
                              const itemTranslation = item?.translations?.find((t) => t.locale === locale) || item?.translations?.[0];
                              return itemTranslation?.name || itemTranslation?.title || item?.name || item?.title || `Product ${item?.id}`;
                            })()}
                          </Link>
                          <div className="price">
                            {pricing.hasDiscount && (
                              <span className="old-price">
                                {locale === "ar"
                                  ? `ج.م ${pricing.originalPriceWithTax.toFixed(2)}`
                                  : `EGP ${pricing.originalPriceWithTax.toFixed(2)}`}
                              </span>
                            )}
                            <span className="new-price">
                              {locale === "ar"
                                ? `ج.م ${pricing.finalPrice.toFixed(2)}`
                                : `EGP ${pricing.finalPrice.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                        {/* <a
                          href="#quickView"
                          onClick={() => setQuickViewItem(item)}
                          data-bs-toggle="modal"
                          className="cls-btn text-btn-uppercase"
                        >
                          Quick View
                        </a> */}
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
