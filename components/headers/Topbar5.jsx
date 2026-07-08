"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "@/i18n/react";
import CurrencySelect from "../common/CurrencySelect";
import LanguageSelect from "../common/LanguageSelect";

export default function Topbar5({ parentClass = "tf-topbar style-2" }) {
  const t = useTranslations("topbar.promoMessages");

  return (
    <div className={parentClass}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-3 d-none d-xl-block">
            <ul className="tf-social-icon style-fill">
              <li>
                <a href="#" className="social-facebook">
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a href="#" className="social-twiter">
                  <i className="icon icon-x" />
                </a>
              </li>
              <li>
                <a href="#" className="social-instagram">
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a href="#" className="social-tiktok">
                  <i className="icon icon-tiktok" />
                </a>
              </li>
              <li>
                <a href="#" className="social-amazon">
                  <i className="icon icon-amazon" />
                </a>
              </li>
              <li>
                <a href="#" className="social-pinterest">
                  <i className="icon icon-pinterest" />
                </a>
              </li>
            </ul>
          </div>
          <div className="col-xl-6 col-12 text-center">
            <Swiper className="swiper tf-sw-top_bar">
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text text-line-clamp-1 text-btn-uppercase fw-semibold letter-1">
                  {t("freeShipping")}
                </p>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text text-line-clamp-1 text-btn-uppercase fw-semibold letter-1">
                  {t("midseasonSale")}
                </p>
              </SwiperSlide>
            </Swiper>
          </div>
          <div className="col-xl-3 d-none d-xl-block">
            <div className="tf-cur justify-content-end">
              <div className="tf-currencies">
                <CurrencySelect topStart />
              </div>
              <div className="tf-languages">
                <LanguageSelect
                  parentClassName="image-select center style-default type-languages"
                  topStart
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
