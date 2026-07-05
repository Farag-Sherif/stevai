import { getTranslations, setRequestLocale } from "@/i18n/server";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import AccountSidebar from "@/components/my-account/AccountSidebar";
import Information from "@/components/my-account/Information";
import Orers from "@/components/my-account/Orers";
import { Link } from "@/i18n/navigation";
import React from "react";

export const metadata = {
  title: "My Account Orders || Stevia",
  description: "Stevia",
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "ar" }];
};

export default async function MyAccountOrdersPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("myAccount");

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <>
        {/* page-title */}
        <div
          className="page-title"
          style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
        >
          <div className="container-full">
            <div className="row">
              <div className="col-12">
                <h3 className="heading text-center">
                  {locale === "ar" ? "حسابي" : "My Account"}
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
                    <Link className="link" href="#">
                      {locale === "ar" ? "الصفحات" : "Pages"}
                    </Link>
                  </li>
                  <li>
                    <i className="icon-arrRight" />
                  </li>
                  <li>{locale === "ar" ? "الطلبات" : "Orders"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* /page-title */}
        <div className="btn-sidebar-account">
          <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount">
            <i className="icon icon-squares-four" />
          </button>
        </div>
      </>

      <section className="flat-spacing">
        <div className="container">
          <div className="my-account-wrap">
            <AccountSidebar />
            <Orers />
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
