"use client";

import React from "react";
import Image from "@/components/common/CompatImage";
import Link from "@/router/Link";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/api/main";
import { useLocale } from "@/i18n/react";

export default function Banner() {
  const locale = useLocale();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const settingsData = settings?.settings;

  return (
    <section>
      <div className="container">
        <div className="flat-img-with-text">
          {settingsData?.offer_section_image1 && (
            <div className="banner banner-left wow fadeInLeft">
              <Image
                alt="banner"
                src={`${settingsData?.offer_image_path}/${settingsData?.offer_section_image1}`}
                width={709}
                height={709}
              />
            </div>
          )}
          <div className="banner-content">
            <div className="content-text wow fadeInUp">
              <h3 className="title text-center fw-5">
                {settingsData?.offer_section_title}
              </h3>
              <p className="desc">{settingsData?.offer_section_content}</p>
            </div>
            <Link
              href={`/collections`}
              className="tf-btn btn-fill wow fadeInUp"
            >
              <span className="text">{settingsData?.offer_section_link}</span>
              <i className="icon icon-arrowUpRight" />
            </Link>
          </div>
          {settingsData?.offer_section_image2 && (
            <div className="banner banner-right wow fadeInRight">
              <Image
                alt="banner"
                src={`${settingsData?.offer_image_path}/${settingsData?.offer_section_image2}`}
                width={945}
                height={709}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
