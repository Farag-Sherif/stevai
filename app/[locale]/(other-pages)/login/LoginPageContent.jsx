"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "@/i18n/react";
import Login from "@/components/otherPages/Login";

export default function LoginPageContent() {
  const t = useTranslations("login");
  const locale = useLocale();

  return (
    <>
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
                  <Link className="link" href="/">
                    {locale === "ar" ? "الرئيسية" : "Homepage"}
                  </Link>
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
      <Login />
    </>
  );
}
