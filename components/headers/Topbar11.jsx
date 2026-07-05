"use client";
import React from "react";
import { useTranslations } from "@/i18n/react";
import CurrencySelect from "../common/CurrencySelect";
import LanguageSelect from "../common/LanguageSelect";

export default function Topbar11() {
  const t = useTranslations("topbar");

  return (
    <div className="tf-topbar style-2 topbar-fullwidth-2 bg-black">
      <div className="row align-items-center">
        <div className="col-sm-6 d-none d-sm-block">
          <ul className="d-flex align-items-center gap-20">
            <li>
              <a
                href={`tel:${t("phone").replace(/\s+/g, "")}`}
                className="link text-white text-caption-1"
              >
                {t("phone")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${t("email")}`}
                className="link text-white text-caption-1"
              >
                {t("email")}
              </a>
            </li>
          </ul>
        </div>
        <div className="col-sm-6 col-12">
          <div className="tf-cur justify-content-center justify-content-sm-end">
            <p className="text-white text-caption-1 d-none d-md-block">
              {t("orderTracking")}
            </p>
            <div className="tf-currencies">
              <CurrencySelect topStart light />
            </div>
            <div className="tf-languages">
              <LanguageSelect
                parentClassName="image-select center style-default type-languages color-white"
                topStart
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
