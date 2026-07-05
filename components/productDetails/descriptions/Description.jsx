import React from "react";
import { getTranslation, isRTL } from "@/utils/translations";
import { calcFinalPrice } from "@/utils/pricing";
import { stripHtml } from "@/utils/stripHtml";

export default function Description({ product, locale = "en" }) {
  const isRtl = isRTL(locale);
  const pricing = product ? calcFinalPrice(product) : null;
  const finalPrice = pricing?.finalPrice ?? (Number(product?.price) || 0);
  const oldPrice = pricing?.hasDiscount ? pricing?.originalPriceWithTax : null;

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="right">
        <div className="letter-1 text-btn-uppercase mb_12">
          {product?.name || "Product Name"}
        </div>
        <div className="mb_12 text-secondary">
          {stripHtml(product?.description || "")}
        </div>
      </div>
      <div className="left">
        <div className="letter-1 text-btn-uppercase mb_12">
          {getTranslation("productInformation", locale)}
        </div>
        <ul className="list-text type-disc mb_12 gap-6">
          <li className="font-2">
            {getTranslation("price", locale)}:{" "}
            {oldPrice != null && (
              <span style={{ textDecoration: "line-through", marginLeft: locale === "ar" ? "8px" : "0", marginRight: locale === "ar" ? "0" : "8px", color: "#999" }}>
                {locale === "ar"
                  ? `ج.م ${Number(oldPrice).toFixed(2)}`
                  : `EGP ${Number(oldPrice).toFixed(2)}`}
              </span>
            )}
            {locale === "ar"
              ? `ج.م ${Number(finalPrice).toFixed(2)}`
              : `EGP ${Number(finalPrice).toFixed(2)}`}
          </li>
          <li className="font-2">
            {getTranslation("category", locale)}:{" "}
            {product?.category?.name || getTranslation("na", locale)}
          </li>
          <li className="font-2">
            {getTranslation("availability", locale)}:{" "}
            {product?.is_available
              ? getTranslation("inStock", locale)
              : getTranslation("outOfStock", locale)}
          </li>
          {product?.brand && (
            <li className="font-2">
              {getTranslation("brand", locale)}: {product.brand}
            </li>
          )}
          {product?.discount > 0 && (
            <li className="font-2">
              {getTranslation("discount", locale)}: {product.discount}%
            </li>
          )}
        </ul>

        {product?.sizes && product.sizes.length > 0 && (
          <div className="mb_12">
            <div className="letter-1 text-btn-uppercase mb_8">
              {getTranslation("availableSizes", locale)}
            </div>
            <div className="d-flex gap-8">
              {product.sizes.map((size) => (
                <span key={size.id} className="size-badge">
                  {size.size}
                </span>
              ))}
            </div>
          </div>
        )}

        {product?.colors && product.colors.length > 0 && (
          <div className="mb_12">
            <div className="letter-1 text-btn-uppercase mb_8">
              {getTranslation("availableColors", locale)}
            </div>
            <div className="d-flex gap-8">
              {product.colors.map((color) => (
                <div
                  key={color.id}
                  className="color-preview"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: color.color,
                    borderRadius: "50%",
                    border: "1px solid #ddd",
                  }}
                  title={color.color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
