"use client";

import { useState, useEffect } from "react";
import { getTranslation, isRTL } from "@/utils/translations";

export default function SizeSelect({
  sizes = [],
  locale = "en",
  activeSize = "",
  setActiveSize = null,
}) {
  const [selectedSizeDefault, setSelectedSizeDefault] = useState(
    sizes.length > 0 ? sizes[0]?.size : ""
  );
  const isRtl = isRTL(locale);

  // Update default size when sizes change
  useEffect(() => {
    if (sizes.length > 0 && !selectedSizeDefault) {
      setSelectedSizeDefault(sizes[0]?.size);
    }
  }, [sizes]);

  const currentSize = activeSize || selectedSizeDefault;

  const handleChange = (size) => {
    if (setActiveSize) {
      setActiveSize(size);
    } else {
      setSelectedSizeDefault(size);
    }
  };

  // Don't render if no sizes available
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className="variant-picker-item" dir={isRtl ? "rtl" : "ltr"}>
      <div className="d-flex justify-content-between mb_12">
        <div className="variant-picker-label">
          {getTranslation("selectedSize", locale)}:
          <span className="text-title variant-picker-label-value">
            {currentSize || getTranslation("product.selectSize", locale)}
          </span>
        </div>
        <a
          href="#size-guide"
          data-bs-toggle="modal"
          className="size-guide text-title link"
        >
          {getTranslation("sizeGuide", locale)}
        </a>
      </div>
      <div className="variant-picker-values gap12">
        {sizes.map((sizeItem, index) => {
          // Handle different size data structures
          const sizeValue =
            sizeItem.size || sizeItem.value || sizeItem.name || sizeItem;
          const sizeId = sizeItem.id || index;

          return (
            <div
              key={sizeId}
              onClick={() => handleChange(sizeValue)}
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                id={`size-${sizeId}`}
                checked={currentSize === sizeValue}
                readOnly
              />
              <label
                className={`style-text size-btn ${
                  currentSize === sizeValue ? "active" : ""
                }`}
                htmlFor={`size-${sizeId}`}
                data-value={sizeValue}
              >
                <span className="text-title">{sizeValue}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
