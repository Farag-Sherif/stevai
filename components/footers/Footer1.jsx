"use client";
import React, { useEffect } from "react";
import Image from "@/components/common/CompatImage";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "@/i18n/react";
import LanguageSelect from "../common/LanguageSelect";
import ToolbarBottom from "../headers/ToolbarBottom";
import ScrollTop from "../common/ScrollTop";
import { footerLinks } from "@/data/footerLinks";
import { getSocialLinks, getAddress, getEmail, getPhone } from "@/api/main";
import { useQuery } from "@tanstack/react-query";

export default function Footer1({
  border = true,
  dark = false,
  hasPaddingBottom = false,
}) {
  const locale = useLocale();
  const {
    data: socialLinks,
    isLoading: socialLinksLoading,
    error: socialLinksError,
  } = useQuery({
    queryKey: ["socialLinks"],
    queryFn: getSocialLinks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: addresses,
    isLoading: addressLoading,
    error: addressError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: emails,
    isLoading: emailLoading,
    error: emailError,
  } = useQuery({
    queryKey: ["emails"],
    queryFn: getEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: phones,
    isLoading: phoneLoading,
    error: phoneError,
  } = useQuery({
    queryKey: ["phones"],
    queryFn: getPhone,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const t = useTranslations();

  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-mobile");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      const content = parent.querySelector(".tf-collapse-content");

      if (parent.classList.contains("open")) {
        parent.classList.remove("open");
        content.style.height = "0px";
      } else {
        parent.classList.add("open");
        content.style.height = content.scrollHeight + 10 + "px";
      }
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []); // Empty dependency array means this will run only once on mount

  return (
    <>
      <footer
        id="footer"
        className={`footer ${dark ? "bg-main" : ""} ${
          hasPaddingBottom ? "has-pb" : ""
        } `}
      >
        <div className={`footer-wrap ${!border ? "border-0" : ""}`}>
          <div className="footer-body">
            <div className="container">
              <div className="row">
                <div className="col-lg-6">
                  <div className="footer-infor">
                    <div className="footer-logo">
                      <Link href={`/`}>
                        <Image
                          alt=""
                          src={
                            locale === "ar"
                              ? `/images/logo/logo.png`
                              : `/images/logo/logo-${locale}.png`
                          }
                          width={100}
                          height={100}
                          style={{ objectFit: "contain" }}
                        />
                      </Link>
                    </div>
                    <div className="footer-address">
                      {/* <Link
                        href={`/contact`}
                        className={`tf-btn-default fw-6 ${
                          dark ? "style-white" : ""
                        } `}
                      >
                        {t("footer.getDirection")}
                        <i className="icon-arrowUpRight" />
                      </Link> */}
                    </div>
                    <ul className="footer-info">
                      {addressLoading ? (
                        <div className="text-caption-1">
                          {t("products.loading")}
                        </div>
                      ) : !addressError && addresses && addresses.length > 0 ? (
                        addresses.map((address) => (
                          <li
                            key={address.id}
                            className="flex gap-2 items-center"
                          >
                            <span className="text-main">
                              <i className="icon-map-pin" />
                            </span>
                            <span className="text-caption-1">
                              {address.address}
                            </span>
                          </li>
                        ))
                      ) : (
                        <p>{t("footer.address")}</p>
                      )}
                      <li>
                        <i className="icon-mail" />
                        {emailLoading ? (
                          <p className="text-caption-1">
                            {t("products.loading")}
                          </p>
                        ) : !emailError && emails && emails.length > 0 ? (
                          <p>{emails[0].email}</p>
                        ) : (
                          <p>{t("footer.email")}</p>
                        )}
                      </li>
                      {phoneLoading ? (
                        <li>
                          <i className="icon-phone" />
                          <p className="text-caption-1">
                            {t("products.loading")}
                          </p>
                        </li>
                      ) : !phoneError && phones && phones.length > 0 ? (
                        phones.map((phone) => (
                          <li key={phone.id}>
                            <i className="icon-phone" />
                            <p>
                              {phone.mobile} ({phone.name})
                            </p>
                          </li>
                        ))
                      ) : (
                        <li>
                          <i className="icon-phone" />
                          <p>{t("footer.phone")}</p>
                        </li>
                      )}
                    </ul>
                    {!socialLinksLoading &&
                      !socialLinksError &&
                      socialLinks &&
                      socialLinks.length > 0 && (
                        <ul
                          className={`tf-social-icon  ${
                            dark ? "style-white" : ""
                          } `}
                        >
                          {socialLinks.map((link) => (
                            <li key={link.id}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                              >
                                <Image
                                  src={`${link.icon_path}`}
                                  alt="Social Icon"
                                  width={20}
                                  height={20}
                                  style={{ width: "auto", height: "auto" }}
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    {socialLinksLoading && (
                      <div className="social-loading">
                        <p className="text-caption-1">
                          {t("products.loading")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="footer-menu">
                    {footerLinks.map((section, sectionIndex) => (
                      <div className="footer-col-block" key={sectionIndex}>
                        <div className="footer-heading text-button footer-heading-mobile">
                          {t(section.headingKey)}
                        </div>
                        <div className="tf-collapse-content">
                          <ul className="footer-menu-list">
                            {section.items.map((item, itemIndex) => (
                              <li className="text-caption-1" key={itemIndex}>
                                {item.isLink ? (
                                  <Link
                                    href={item.href}
                                    className="footer-menu_item"
                                  >
                                    {t(item.labelKey)}
                                  </Link>
                                ) : (
                                  <a
                                    href={item.href}
                                    className="footer-menu_item"
                                  >
                                    {t(item.labelKey)}
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="footer-bottom-wrap">
                    <div className="left">
                      <p className="text-caption-1">
                        ©{new Date().getFullYear()} {t("footer.copyright")}
                      </p>
                      <p className="text-caption-1">
                        {t("footer.designDevelopment")} ©{" "}
                        <a
                          href="https://bluebrain-co.com/ar"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-main hover:underline"
                        >
                          {t("footer.bluebrain")}
                        </a>
                      </p>
                      <div className="tf-cur justify-content-end">
                        <div className="tf-currencies">
                          {/* <CurrencySelect light={dark ? true : false} /> */}
                        </div>
                        <div className="tf-languages">
                          <LanguageSelect
                            parentClassName={`image-select center style-default type-languages ${
                              dark ? "color-white" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Payment icons removed - only show active payment methods */}
                    {/* <div className="tf-payment">
                      <p className="text-caption-1">
                        {t("footer.paymentText")}
                      </p>
                      <ul>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-1.png"
                            width={100}
                            height={64}
                          />
                        </li>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-2.png"
                            width={100}
                            height={64}
                          />
                        </li>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-3.png"
                            width={100}
                            height={64}
                          />
                        </li>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-4.png"
                            width={98}
                            height={64}
                          />
                        </li>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-5.png"
                            width={102}
                            height={64}
                          />
                        </li>
                        <li>
                          <Image
                            alt=""
                            src="/images/payment/img-6.png"
                            width={98}
                            height={64}
                          />
                        </li>
                      </ul>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ScrollTop hasPaddingBottom={hasPaddingBottom} />
      <ToolbarBottom />
    </>
  );
}
