"use client";
import { useLocale } from "@/i18n/react";
import React from "react";

export default function FilterMeta({
  allProps,
  productLength,
  paginationInfo,
}) {
  const locale = useLocale();
  const getResultText = () => {
    if (paginationInfo) {
      const { from, to, total } = paginationInfo;
      return locale === "ar"
        ? `معرض ${from || 0}-${to || 0} من ${total || 0} منتجات`
        : `Showing ${from || 0}-${to || 0} of ${total || 0} Products`;
    }
    return locale === "ar"
      ? `${productLength} منتجات معروضة`
      : `${productLength} Products Found`;
  };

  return (
    <div className="meta-filter-shop" style={{}}>
      <div id="product-count-grid" className="count-text">
        {getResultText()}
      </div>

      <div id="applied-filters">
        {allProps.availability != "All" ? (
          <span
            className="filter-tag"
            onClick={() => allProps.setAvailability("All")}
          >
            {allProps.availability.label}
            <span className="remove-tag icon-close" />
          </span>
        ) : (
          ""
        )}

        {allProps.brands.length ? (
          <React.Fragment>
            {allProps.brands.map((brand, index) => (
              <span
                key={`brand-filter-${brand}-${index}`}
                className="filter-tag"
                onClick={() => allProps.removeBrand(brand)}
              >
                {brand}
                <span className="remove-tag icon-close" />
              </span>
            ))}
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
      {allProps.availability != "All" || allProps.brands.length ? (
        <button
          id="remove-all"
          className="remove-all-filters text-btn-uppercase"
          onClick={allProps.clearFilter}
        >
          REMOVE ALL <i className="icon icon-close" />
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
