"use client";
import React from "react";
import Link from "@/router/Link";
import { usePathname } from "@/router/navigation";
import { getTranslation, isRTL } from "@/utils/translations";

export default function Breadcumb({ product, locale = "en" }) {
  const pathname = usePathname();
  const isRtl = isRTL(locale);

  return (
    <div className="tf-breadcrumb" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container">
        <div className="tf-breadcrumb-wrap">
          <div className="tf-breadcrumb-list">
            <Link href="/" className="text text-caption-1">
              {getTranslation("homepage", locale)}
            </Link>

            <i className={`icon ${isRtl ? "icon-arrLeft" : "icon-arrRight"}`} />
            <span className="text text-caption-1">{product.name}</span>
          </div>
          {/* <div className="tf-breadcrumb-prev-next">
            <Link
              href={`/product-detail/${
                product.id <= 1 ? 1 : product.id - 1
              }-${product.name}`}
              className="tf-breadcrumb-prev"
            >
              <i className="icon icon-arrLeft" />
            </Link>
            <a href="#" className="tf-breadcrumb-back">
              <i className="icon icon-squares-four" />
            </a>
            <Link
              href={`/product-detail/${product.id + 1}-${
                product.name
              }`}
              className="tf-breadcrumb-next"
            >
              <i className="icon icon-arrRight" />
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
