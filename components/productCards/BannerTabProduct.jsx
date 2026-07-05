"use client";
import React, { useMemo } from "react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useContextElement } from "@/context/Context";
import { calcFinalPrice } from "@/utils/pricing";
import { useLocale } from "@/i18n/react";

export default function BannerTabProduct({ product }) {
  const { setQuickViewItem } = useContextElement();
  const locale = useLocale();

  const pricing = useMemo(
    () =>
      calcFinalPrice({
        ...product,
        price: Number(product.price ?? product.basePrice) || 0,
        discount: Number(product.discount) || 0,
        added_value: product.added_value,
        total: product.total,
      }),
    [product]
  );

  const formatCurrency = (amount) => {
    const n = Number(amount) || 0;
    const prefix = locale === "ar" ? "ج.م " : "EGP ";
    return `${prefix}${n.toFixed(2)}`;
  };

  const slugTitle =
    (product.title || product.name || "")
      .toString()
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || product.id;

  return (
    <div className="collection-position-2 hover-img">
      <a className="img-style">
        <Image
          className="lazyload"
          alt="banner-cls"
          src={product.imgSrc}
          width={710}
          height={945}
        />
        {pricing.hasDiscount && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">
              -{pricing.discountPercentage}%
            </span>
          </div>
        )}
      </a>
      <div className="content cls-content">
        <div className="cls-info">
          <Link
            href={`/product-detail/${product.id}-${slugTitle}`}
            className="text-title link text-line-clamp-1"
          >
            {product.title}
          </Link>
          <div className="price">
            {pricing.hasDiscount && (
              <span className="old-price">
                {formatCurrency(pricing.originalPriceWithTax)}
              </span>
            )}
            <span className="new-price">
              {formatCurrency(pricing.finalPrice)}
            </span>
          </div>
        </div>
        <a
          href="#quickView"
          onClick={() => setQuickViewItem(product)}
          data-bs-toggle="modal"
          className="cls-btn text-btn-uppercase"
        >
          Quick View
        </a>
      </div>
    </div>
  );
}
