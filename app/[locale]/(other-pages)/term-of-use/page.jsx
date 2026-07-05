import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Terms from "@/components/otherPages/Terms";
import React from "react";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "@/i18n/server";
export const metadata = {
  title: "Terms of Use || Stevia - Terms of Use",
  description: "Stevia - Terms of Use",
};

export default async function TermsOfUsePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
                {locale === "ar" ? "الشروط والأحكام" : "Terms of use"}
              </h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {locale === "ar" ? "الرئيسية" : "Homepage"}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    {locale === "ar" ? "الصفحات" : "Pages"}
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{locale === "ar" ? "الشروط والأحكام" : "Terms of use"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Terms />
      <Footer1 />
    </>
  );
}
