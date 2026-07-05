import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import StoreLocations1 from "@/components/otherPages/StoreLocations1";
import React from "react";
import Link from "@/router/Link";
import { useLocale } from "@/i18n/react";
export const metadata = {
  title: "Store List || Stevia - Multipurpose React Nextjs eCommerce Template",
  description: "Stevia - Multipurpose React Nextjs eCommerce Template",
};

export default function StorelistPage() {
  const locale = useLocale();
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
                {locale === "en" ? "Store Location" : "موقع المتجر"}
              </h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {locale === "en" ? "Homepage" : "الرئيسية"}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    {locale === "en" ? "Pages" : "الصفحات"}
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{locale === "en" ? "Store Location" : "موقع المتجر"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <StoreLocations1 />
      <Footer1 />
    </>
  );
}
