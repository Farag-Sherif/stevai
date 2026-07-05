"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import LanguageSelect from "../common/LanguageSelect";
// import CurrencySelect from "../common/CurrencySelect";
import { usePathname } from "@/router/navigation";
import { useTranslations } from "@/i18n/react";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { getAddress, getEmail, getPhone } from "@/api/main";

export default function MobileMenu() {
  const { user } = useUserStore();
  const pathname = usePathname();
  const t = useTranslations();

  // Fetch dynamic data using React Query
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

  const navItems = [
    { name: t("navigation.home"), href: "/" },
    { name: t("navigation.shop"), href: "/shop" },
    { name: t("navigation.offers"), href: "/offers" },
    { name: t("navigation.storeList"), href: "/our-brands" },
    { name: t("navigation.exhibition"), href: "/exhibition" },
    { name: t("navigation.aboutUs"), href: "/about-us" },
    { name: t("navigation.contact"), href: "/contact" },
  ];

  return (
    <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <div className="mb-content-top">
            <ul className="nav-ul-mb" id="wrapper-menu-navigation">
              {navItems.map((item, index) => (
                <li
                  key={index}
                  className={`nav-mb-item ${
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                      ? "active"
                      : ""
                  }`}
                >
                  <Link href={item.href} className="mb-menu-link">
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-other-content">
            {!user && (
              <div className="group-icon">
                <Link href={`/wish-list`} className="site-nav-icon">
                  <svg
                    className="icon"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.8401 4.60987C20.3294 4.09888 19.7229 3.69352 19.0555 3.41696C18.388 3.14039 17.6726 2.99805 16.9501 2.99805C16.2276 2.99805 15.5122 3.14039 14.8448 3.41696C14.1773 3.69352 13.5709 4.09888 13.0601 4.60987L12.0001 5.66987L10.9401 4.60987C9.90843 3.57818 8.50915 2.99858 7.05012 2.99858C5.59109 2.99858 4.19181 3.57818 3.16012 4.60987C2.12843 5.64156 1.54883 7.04084 1.54883 8.49987C1.54883 9.95891 2.12843 11.3582 3.16012 12.3899L4.22012 13.4499L12.0001 21.2299L19.7801 13.4499L20.8401 12.3899C21.3511 11.8791 21.7565 11.2727 22.033 10.6052C22.3096 9.93777 22.4519 9.22236 22.4519 8.49987C22.4519 7.77738 22.3096 7.06198 22.033 6.39452C21.7565 5.72706 21.3511 5.12063 20.8401 4.60987V4.60987Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t("navigation.wishlist")}
                </Link>
                <Link href={`/login`} className="site-nav-icon">
                  <svg
                    className="icon"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t("navigation.login")}
                </Link>
              </div>
            )}
            <div className="mb-notice">
              <Link href={`/contact`} className="text-need">
                {t("mobileMenu.needHelp")}
              </Link>
            </div>
            <div className="mb-contact">
              {addressLoading ? (
                <p className="text-caption-1">{t("products.loading")}</p>
              ) : !addressError && addresses && addresses.length > 0 ? (
                <p className="text-caption-1">{addresses[0].address}</p>
              ) : (
                <p className="text-caption-1">{t("footer.address")}</p>
              )}
              <Link
                href={`/contact`}
                className="tf-btn-default text-btn-uppercase"
              >
                {t("footer.getDirection")}
                <i className="icon-arrowUpRight" />
              </Link>
            </div>
            <ul className="mb-info">
              <li>
                <i className="icon icon-mail" />
                {emailLoading ? (
                  <p className="text-caption-1">{t("products.loading")}</p>
                ) : !emailError && emails && emails.length > 0 ? (
                  <p>{emails[0].email}</p>
                ) : (
                  <p>{t("topbar.email")}</p>
                )}
              </li>
              {phoneLoading ? (
                <li>
                  <i className="icon icon-phone" />
                  <p className="text-caption-1">{t("products.loading")}</p>
                </li>
              ) : !phoneError && phones && phones.length > 0 ? (
                phones.map((phone) => (
                  <li key={phone.id}>
                    <i className="icon icon-phone" />
                    <p>
                      {phone.mobile} {phone.name && `(${phone.name})`}
                    </p>
                  </li>
                ))
              ) : (
                <li>
                  <i className="icon icon-phone" />
                  <p>{t("topbar.phone")}</p>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mb-bottom">
          <div className="bottom-bar-language">
            {/* <div className="tf-currencies">
              <CurrencySelect />
            </div> */}
            <div className="tf-languages">
              <LanguageSelect parentClassName="image-select center style-default type-languages" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
