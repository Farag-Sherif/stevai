"use client";

import React, { useState, useEffect } from "react";
import { getTranslation, isRTL } from "@/utils/translations";

export default function ColorSelect({
  activeColor = "",
  setActiveColor,
  colors = [],
  locale = "en",
}) {
  const [activeColorDefault, setActiveColorDefault] = useState(
    colors.length > 0 ? colors[0]?.color : ""
  );
  const isRtl = isRTL(locale);

  // Update default color when colors change
  useEffect(() => {
    if (colors.length > 0 && !activeColorDefault) {
      setActiveColorDefault(colors[0]?.color);
    }
  }, [colors]);

  const handleSelectColor = (colorValue) => {
    if (setActiveColor) {
      setActiveColor(colorValue);
    } else {
      setActiveColorDefault(colorValue);
    }
  };

  const currentActiveColor = activeColor || activeColorDefault;

  // Don't render if no colors available
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className="variant-picker-item" dir={isRtl ? "rtl" : "ltr"}>
      <div className="variant-picker-label mb_12">
        {getTranslation("colors", locale)}:
        <span
          className="text-title variant-picker-label-value value-currentColor"
          style={{ textTransform: "capitalize" }}
        >
          {currentActiveColor || getTranslation("product.selectColor", locale)}
        </span>
      </div>
      <div className="variant-picker-values">
        {colors.map((colorItem, index) => {
          // Handle different color data structures
          const colorValue =
            colorItem.color || colorItem.value || colorItem.name || colorItem;
          const colorDisplay =
            colorItem.color ||
            colorItem.hex ||
            colorItem.value ||
            colorItem.name ||
            colorItem;
          const colorId = colorItem.id || index;

          return (
            <React.Fragment key={colorId}>
              <input
                id={`color-${colorId}`}
                type="radio"
                readOnly
                checked={currentActiveColor === colorValue}
              />
              <label
                onClick={() => {
                  handleSelectColor(colorValue);
                }}
                className={`hover-tooltip tooltip-bot radius-60 color-btn ${
                  currentActiveColor === colorValue ? "active" : ""
                }`}
                htmlFor={`color-${colorId}`}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="btn-checkbox"
                  style={{
                    backgroundColor: colorDisplay,
                    border:
                      colorDisplay === "#ffffff" ||
                      colorDisplay.toLowerCase() === "white"
                        ? "1px solid #ddd"
                        : "1px solid transparent",
                  }}
                />
                <span className="tooltip">{colorValue}</span>
              </label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
