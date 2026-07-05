import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import AccountSidebar from "@/components/my-account/AccountSidebar";
import Address from "@/components/my-account/Address";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations, setRequestLocale } from "@/i18n/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations({
    locale: locale,
    namespace: "myAccount",
  });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MyAccountAddressPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale: locale,
    namespace: "myAccount",
  });

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
                    <a className="link" href="#">
                      {t("pages")}
                    </a>
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
            <Address />
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
