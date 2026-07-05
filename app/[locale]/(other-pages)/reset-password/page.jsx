"use client";

import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import ResetPass from "@/components/otherPages/ResetPass";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "@/i18n/react";
import { Suspense } from "react";

function ResetPasswordContent() {
  const locale = useLocale();
  const t = useTranslations("login");
  const isRtl = locale === "ar";

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">{t("resetPasswordTitle")}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    {locale === "ar" ? "الصفحة الرئيسية" : "Homepage"}
                  </Link>
                </li>
                <li>
                  <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                </li>
                <li>
                  <a className="link" href="#">
                    {locale === "ar" ? "الصفحات" : "Pages"}
                  </a>
                </li>
                <li>
                  <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                </li>
                <li>{t("resetPasswordTitle")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="container"><div className="text-center p-5">Loading...</div></div>}>
        <ResetPass />
      </Suspense>
      <Footer1 />
    </>
  );
}

export default ResetPasswordContent;


