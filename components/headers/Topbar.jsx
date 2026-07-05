"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "@/i18n/react";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";

export default function Topbar() {
  const t = useTranslations("topbar");

  return (
    <div className="tf-topbar bg-main">
      <div className="container">
        <div className="tf-topbar_wrap d-flex align-items-center justify-content-center justify-content-xl-between">
          <ul className="topbar-left">
            <li>
              <a
                className="text-caption-1 text-white"
                href={`tel:${t("phone")}`}
              >
                {t("phone")}
              </a>
            </li>
            <li>
              <a
                className="text-caption-1 text-white"
                href={`mailto:${t("email")}`}
              >
                {t("email")}
              </a>
            </li>
            <li>
              <Link
                className="text-caption-1 text-white text-decoration-underline"
                href="/store-list"
              >
                {t("ourStore")}
              </Link>
            </li>
          </ul>
          <div className="topbar-right d-none d-xl-block">
            <div className="tf-cur justify-content-end">
              <div className="tf-currencies">
                <CurrencySelect light topStart />
              </div>
              <div className="tf-languages position-relative">
                <LanguageSelect
                  parentClassName="image-select center style-default type-languages color-white"
                  topStart={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
