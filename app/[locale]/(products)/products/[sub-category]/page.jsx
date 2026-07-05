import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import SubCategoryProducts from "@/components/products/SubCategoryProducts";

import { Link } from "@/i18n/navigation";
import React from "react";

export default async function ProductStylePage1({ params }) {
  const { "sub-category": subCategory, locale } = await params;
  const subCategoryId = subCategory?.split("-")[0];
  const subCategoryName = decodeURIComponent(subCategory?.split("-")[1] || "");

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
              <h3 className="heading text-center">{subCategoryName}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {locale === "ar" ? "الرئيسية" : "Home"}
                  </Link>
                </li>
                <li>
                  <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                </li>
                <li>{subCategoryName}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <SubCategoryProducts 
        subCategoryId={subCategoryId}
        subCategoryName={subCategoryName}
        offers={false}
      />
      <Footer1 />
    </>
  );
}
