import { getTranslations, setRequestLocale } from "@/i18n/server";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import AccountSidebar from "@/components/my-account/AccountSidebar";
import { Link } from "@/i18n/navigation";
import OrderDetails from "@/components/my-account/OrderDetails";
import React from "react";
import { redirect } from "@/router/navigation";

export const metadata = {
  title: "Order Details || Stevia",
  description: "Stevia - Order Details",
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "ar" }];
};

export default async function MyAccountOrderDetailsPage({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!id) {
    redirect("/my-account-orders");
  }

  const t = await getTranslations("myAccount");

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
                    {t("homepage")}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <Link className="link" href="/my-account-orders">
                    {locale === "ar" ? "الطلبات" : "Orders"}
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{locale === "ar" ? `طلب #${id}` : `Order #${id}`}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="btn-sidebar-account">
        <button data-bs-toggle="offcanvas" data-bs-target="#mbAccount">
          <i className="icon icon-squares-four" />
        </button>
      </div>

      <section className="flat-spacing">
        <div className="container">
          <div className="my-account-wrap">
            <AccountSidebar />
            <OrderDetails orderId={id} />
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
