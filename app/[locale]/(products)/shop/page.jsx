import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import ShopCategories from "@/components/products/ShopCategories";
import SubCategoriesFilter from "@/components/products/SubCategoriesFilter";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export async function generateMetadata({ params }) {
  try {
    const { locale } = await params;

    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: "navigation" });
    
    return {
      title: t("shop") + " | Stevia",
      description: t("shop") + " - " + (locale === "ar" ? "تصفح جميع منتجاتنا" : "Browse all our products"),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error generating metadata for shop page:", error);
    }
    return {
      title: "Shop | Stevia",
      description: "Browse all our products",
    };
  }
}

export default async function ShopCategoriesTopPage1({ params }) {
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
                  {tNav("shop") || (locale === "ar" ? "المتجر" : "Shop")}
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
                  <li>{tNav("shop") || (locale === "ar" ? "المتجر" : "Shop")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ShopCategories />
        <SubCategoriesFilter />
        <Products order={1} parentClass="flat-spacing pt-0" offers={false} />
        <Footer1 />
      </>
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error rendering shop page:", error);
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
                  {locale === "ar" ? "المتجر" : "Shop"}
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
                  <li>{locale === "ar" ? "المتجر" : "Shop"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ShopCategories />
        <SubCategoriesFilter />
        <Products order={1} parentClass="flat-spacing pt-0" offers={false} />
        <Footer1 />
      </>
    );
  }
}
