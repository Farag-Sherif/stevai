import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Wishlist from "@/components/otherPages/Wishlist";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export default async function WishListPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("wishlist");
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
                {t("homepage")}
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>
              <Link className="link" href={`/shop`}>
                {t("shop")}
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>{t("title")}</li>
          </ul>
        </div>
      </div>

      <Wishlist />

      <Footer1 />
    </>
  );
}
