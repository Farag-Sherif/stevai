"use client";
import { useTranslations } from "@/i18n/react";

export default function Sorting({ allProps }) {
  const t = useTranslations("products");

  const filterOptions = [
    t("sortDefault"),
    t("titleAscending"),
    t("titleDescending"),
    t("priceAscending"),
    t("priceDescending"),
  ];
  return (
    <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
      <div className="btn-select">
        <span className="text-sort-value">{allProps.sortingOption}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {filterOptions.map((option, i) => (
          <div
            onClick={() => allProps.setSortingOption(option)}
            key={i}
            className={`select-item ${
              allProps.sortingOption == option ? "active" : ""
            }`}
          >
            <span className="text-value-item">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
