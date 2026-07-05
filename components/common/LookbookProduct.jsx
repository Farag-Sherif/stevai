"use client";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import React from "react";
import { useContextElement } from "@/context/Context";
import { useLocale } from "@/i18n/react";

export default function LookbookProduct({ product, styleClass = "style-row" }) {
  const locale = useLocale();
  const { setQuickViewItem } = useContextElement();
  return (
    <div className={`loobook-product ${styleClass} `}>
      <div className="img-style">
        <Image 
          alt={product.title || "Product image"} 
          src={product.imgSrc} 
          width={151} 
          height={151}
          loading="lazy"
          fetchPriority="auto"
        />
      </div>
      <div className="content">
        <div className="info">
          <Link
            href={`/product-detail/${product.id}`}
            className="text-title text-line-clamp-1 link"
          >
            {product.title}
          </Link>
          <div className="price text-button">${product.price.toFixed(2)}</div>
        </div>
        <a
          href="#quickView"
          onClick={() => setQuickViewItem(product)}
          data-bs-toggle="modal"
          className="btn-lookbook btn-line"
        >
          Quick View
        </a>
      </div>
    </div>
  );
}
