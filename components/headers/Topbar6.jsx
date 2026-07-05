"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "@/i18n/react";
// import CurrencySelect from "../common/CurrencySelect";
import LanguageSelect from "../common/LanguageSelect";
import { useQuery } from "@tanstack/react-query";
import { getEmail, getPhone } from "@/api/main";

export default function Topbar6({ bgColor = "bg-blue-2" }) {
  const {
    data: emails,
    isLoading: emailLoading,
    error: emailError,
  } = useQuery({
    queryKey: ["emails"],
    queryFn: getEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: phones,
    isLoading: phoneLoading,
    error: phoneError,
  } = useQuery({
    queryKey: ["phones"],
    queryFn: getPhone,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const t = useTranslations("topbar");

  return (
    <div className={`tf-topbar ${bgColor}`}>
      <div className="container">
        <div className="tf-topbar_wrap d-flex align-items-center justify-content-center justify-content-xl-between">
          <ul className="topbar-left">
            <li>
              <a
                className="text-caption-1 text-white"
                href={`tel:${phones?.[0]?.phone}`}
              >
                {phones?.[0]?.phone}
              </a>
            </li>
            <li>
              <a
                className="text-caption-1 text-white"
                href={`mailto:${emails?.[0]?.email}`}
              >
                {emails?.[0]?.email}
              </a>
            </li>
            <li>
              <Link
                className="text-caption-1 text-white text-decoration-underline"
                href="/our-brands"
              >
                {t("ourStore")}
              </Link>
            </li>
          </ul>
          <div className="topbar-right d-none d-xl-block">
            <div className="tf-cur justify-content-end">
              <div className="tf-currencies">
                {/* <CurrencySelect topStart light /> */}
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
    </div>
  );
}
