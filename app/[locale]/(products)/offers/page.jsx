import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import ShopProducts from "@/components/products/ShopProducts";
import ShopCategories from "@/components/products/ShopCategories";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export async function generateMetadata({ params }) {
  try {
    const { locale } = await params;

    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: "navigation" });
    
    return {
      title: t("offers") + " | Stevia",
      description: t("offers") + " - " + (locale === "ar" ? "أفضل العروض والخصومات" : "Best offers and discounts"),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error generating metadata for offers page:", error);
    }
    return {
      title: "Offers | Stevia",
      description: "Best offers and discounts",
    };
  }
}

export default async function OffersPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);
  
  try {
    const tNav = await getTranslations({ locale, namespace: "navigation" });
    
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
                  {tNav("offers") || (locale === "ar" ? "العروض" : "Offers")}
                </h3>
                <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                  <li>
                    <Link className="link" href={`/`} prefetch={true}>
                      {tNav("home") || (locale === "ar" ? "الرئيسية" : "Home")}
                    </Link>
                  </li>
                  <li>
                    <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                  </li>
                  <li>{tNav("offers") || (locale === "ar" ? "العروض" : "Offers")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ShopCategories />
        <ShopProducts offers={true} />
        <Footer1 />
      </>
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error rendering offers page:", error);
    }
    // Fallback rendering if translations fail
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
                  {locale === "ar" ? "العروض" : "Offers"}
                </h3>
                <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                  <li>
                    <Link className="link" href={`/`} prefetch={true}>
                      {locale === "ar" ? "الرئيسية" : "Home"}
                    </Link>
                  </li>
                  <li>
                    <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                  </li>
                  <li>{locale === "ar" ? "العروض" : "Offers"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ShopCategories />
        <ShopProducts offers={true} />
        <Footer1 />
      </>
    );
  }
}
