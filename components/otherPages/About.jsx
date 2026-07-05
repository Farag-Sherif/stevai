"use client";
import React, { useState } from "react";
import Image from "@/components/common/CompatImage";
import { getSettings } from "@/api/main";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n/react";

export default function About() {
  const locale = useLocale();
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const [activeTab, setActiveTab] = useState(1);

  if (isLoading) {
    return (
      <section className="flat-spacing about-us-main pb_0">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p>جاري تحميل بيانات الشركة...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing about-us-main pb_0">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p>حدث خطأ في تحميل بيانات الشركة</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const settingsData = settings?.settings;

  return (
    <section className="flat-spacing about-us-main pb_0">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="about-us-features wow fadeInLeft">
              <Image
                className="lazyload"
                data-src={
                  settingsData?.about_section_image_path ||
                  "/images/banner/about-us.jpg"
                }
                alt="image-team"
                src={
                  settingsData?.about_section_image_path ||
                  "/images/banner/about-us.jpg"
                }
                width={930}
                height={618}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="about-us-content">
              <h3 className="title wow fadeInUp">
                {settingsData?.about_section_title ||
                  "إطلالة – حيث تجد كل امرأة إطلالتها الفريدة"}
              </h3>
              <div className="widget-tabs style-3">
                <ul className="widget-menu-tab wow fadeInUp">
                  <li
                    className={`item-title ${activeTab == 1 ? "active" : ""} `}
                    onClick={() => setActiveTab(1)}
                  >
                    <span className="inner text-button">
                      {locale === "ar" ? "مقدمة" : "Introduction"}
                    </span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 2 ? "active" : ""} `}
                    onClick={() => setActiveTab(2)}
                  >
                    <span className="inner text-button">
                      {locale === "ar" ? "رؤيتنا" : "Vision"}
                    </span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 3 ? "active" : ""} `}
                    onClick={() => setActiveTab(3)}
                  >
                    <span className="inner text-button">
                      {locale === "ar"
                        ? "ما يميزنا"
                        : "What makes us different"}
                    </span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 4 ? "active" : ""} `}
                    onClick={() => setActiveTab(4)}
                  >
                    <span className="inner text-button">
                      {locale === "ar" ? "التزامنا" : "Our commitment"}
                    </span>
                  </li>
                </ul>
                <div className="widget-content-tab wow fadeInUp">
                  <div
                    className={`widget-content-inner ${
                      activeTab == 1 ? "active" : ""
                    } `}
                  >
                    <p>
                      {settingsData?.about_section_introduction ||
                        "مرحبًا بكِ في إطلالة، وجهتكِ الأولى لأناقة الموضة النسائية العصرية. كل قطعة لدينا تحكي قصة أنوثة وجمال وتفرّد."}
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 2 ? "active" : ""
                    } `}
                  >
                    <p>
                      {settingsData?.about_section_vision ||
                        "رؤيتنا أن نصبح رمزًا للأنوثة العصرية، من خلال أزياء تعبّر عن القوة والجمال والرقي."}
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 3 ? "active" : ""
                    } `}
                  >
                    <p>
                      {settingsData?.about_section_apart ||
                        "ما يميز إطلالة هو شغفنا بالتصاميم النادرة والخالدة، والمختارة من أرقى المصممين حول العالم."}
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 4 ? "active" : ""
                    } `}
                  >
                    <p>
                      {settingsData?.about_section_commitment ||
                        "نلتزم بتقديم أزياء راقية تعكس قوة المرأة وتعزز من ثقتها بنفسها في كل إطلالة."}
                    </p>
                  </div>
                </div>
              </div>
              {/* <a
                href={settingsData?.about_section_button_link || "#"}
                className="tf-btn btn-fill wow fadeInUp"
              >
                <span className="text text-button">
                  {settingsData?.about_section_button_text || "اقرأ المزيد"}
                </span>
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
