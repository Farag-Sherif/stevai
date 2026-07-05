import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Register from "@/components/otherPages/Register";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export const metadata = {
  title: "Login || Stevia - Multipurpose React Nextjs eCommerce Template",
  description: "Stevia - Multipurpose React Nextjs eCommerce Template",
};

export default async function RegisterPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("register");
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
                    {locale === "ar" ? "الرئيسية" : "Homepage"}
                  </Link>
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

      <Register />
      <Footer1 />
    </>
  );
}
