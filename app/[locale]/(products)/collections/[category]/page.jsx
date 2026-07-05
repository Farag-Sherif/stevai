import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import CategoryProducts from "@/components/products/CategoryProducts";
import { Link } from "@/i18n/navigation";
import React from "react";

export default async function ShopCollectionPage({ params }) {
  const { category, locale } = await params;
  const categoryId = category?.split("-")[0];
  const categoryName = decodeURIComponent(category?.split("-")[1] || "");

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
              <h3 className="heading text-center">{categoryName}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {locale === "ar" ? "الرئيسية" : "Homepage"}
                  </Link>
                </li>
                <li>
                  <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                </li>
                <li>{categoryName}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CategoryProducts 
        categoryId={categoryId} 
        categoryName={categoryName}
        offers={false}
      />
      <Footer1 />
    </>
  );
}
