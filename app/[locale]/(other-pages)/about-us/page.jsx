import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import About from "@/components/otherPages/About";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "aboutUs",
  });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutUsPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "aboutUs",
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
              <h3 className="heading text-center">{t("title")}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {t("homepage")}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    {t("pages")}
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{t("title")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <About />
      {/* <Brands parentClass="flat-spacing-5 mt-5 bg-surface" /> */}
      <Testimonials />
      <Footer1 />
    </>
  );
}
