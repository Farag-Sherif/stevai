import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import RecentProducts from "@/components/otherPages/RecentProducts";
import ShopCart from "@/components/otherPages/ShopCart";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export const metadata = {
  title:
    "Shopping Cart || Stevia - Multipurpose React Nextjs eCommerce Template",
  description: "Stevia - Multipurpose React Nextjs eCommerce Template",
};

export default async function ShopingCartPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("cart");

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container">
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
            <li>
              <Link className="link" href={`/shop`}>
                {locale === "ar" ? "المتجر" : "Shop"}
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>{t("title")}</li>
          </ul>
        </div>
      </div>

      <ShopCart />
      {/* <RecentProducts /> */}
      <Footer1 />
    </>
  );
}
