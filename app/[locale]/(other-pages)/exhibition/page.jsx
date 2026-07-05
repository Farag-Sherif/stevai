import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Exhibition from "@/components/otherPages/Exhibition";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "exhibition",
  });

  return {
    title: t("metaTitle") || "Exhibition - Stevia",
    description: t("metaDescription") || "Browse our exhibition of images, videos, and files",
  };
}

export default async function ExhibitionPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "exhibition",
  });

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">
                {t("title") || (locale === "ar" ? "المعرض" : "Exhibition")}
              </h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {t("homepage") || (locale === "ar" ? "الرئيسية" : "Homepage")}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    {t("pages") || (locale === "ar" ? "الصفحات" : "Pages")}
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{t("title") || (locale === "ar" ? "المعرض" : "Exhibition")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Exhibition locale={locale} />
      <Footer1 />
    </>
  );
}

