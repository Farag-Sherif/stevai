import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Collections from "@/components/products/Collections";
import { Link } from "@/i18n/navigation";
import React from "react";

export default async function ShopCollectionPage({ params }) {
  const { locale } = await params;

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
                {locale === "ar" ? "المجموعات" : "Collections"}
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
                <li>{locale === "ar" ? "المجموعات" : "Collections"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Collections />
      <Footer1 />
    </>
  );
}
