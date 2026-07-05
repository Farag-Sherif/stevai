"use client";

import React from "react";
import Nav from "./Nav";
import Image from "@/components/common/CompatImage";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "@/i18n/react";
import CartLength from "../common/CartLength";
import { useUserStore } from "@/store/userStore";
import { logout } from "@/api/auth";

export default function Header1({ fullWidth = false }) {
  const locale = useLocale();
  const { user, clearUser } = useUserStore();
  const t = useTranslations("header");
  const router = useRouter();
  const handleLogout = () => {
    // Make logout feel instant: update UI first, then call server
    clearUser();
    logout().catch((e) => console.error("Logout failed:", e));
    router.replace("/login");
  };

  return (
    <header
      id="header"
      className={`header-default ${fullWidth ? "header-fullwidth" : ""} `}
    >
      <div className={fullWidth ? "" : "container"}>
        <div className="row wrapper-header align-items-center">
          <div className="col-md-4 col-2 d-xl-none">
            <a
              href="#mobileMenu"
              className="mobile-menu"
              data-bs-toggle="offcanvas"
              aria-controls="mobileMenu"
              aria-label={t("menu") || "Menu"}
            >
              <i className="icon icon-categories" />
            </a>
          </div>
          <div className="col-xl-3 col-md-4 col-4">
            <Link href={`/`} className="logo-header" prefetch={true}>
              <Image
                alt="logo"
                className="logo"
                src={
                  locale === "en"
                    ? "/images/logo/logo-en.png"
                    : "/images/logo/logo.png"
                }
                width={100}
                height={100}
                priority
                fetchPriority="high"
              />
            </Link>
          </div>
          <div className="col-xl-6 d-none d-xl-block">
            <nav className="box-navigation text-center">
              <ul className="box-nav-ul d-flex align-items-center justify-content-center">
                <Nav />
              </ul>
            </nav>
          </div>
          <div className="col-xl-3 col-md-4 col-6">
            <ul className="nav-icon d-flex justify-content-end align-items-center">
              {/* Search - Hidden on smallest screens, visible on md+ */}
              <li className="nav-search">
                <a
                  href="#search"
                  data-bs-toggle="modal"
                  className="nav-icon-item"
                  aria-label={t("search") || "Search"}
                >
                  <svg
                    className="icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21.35 21.0004L17 16.6504"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              {/* User Account - no hash in URL; dropdown shows on hover */}
              <li className="nav-account d-block">
                <button
                  type="button"
                  className="nav-icon-item d-flex align-items-center justify-content-center border-0 bg-transparent p-0"
                  aria-label={user ? t("myAccount") || "My Account" : t("login") || "Login"}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <svg
                    className="icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
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
                </button>
                <div className="dropdown-account dropdown-login">
                  {user ? (
                    <div className="sub-top">
                      <div className="user-info">
                        <h5>{user.fname || t("user")}</h5>
                        <p>{user.email}</p>
                      </div>
                      <ul className="user-menu">
                        <li>
                          <Link href="/my-account">{t("myProfile")}</Link>
                        </li>
                        <li>
                          <Link href="/my-account-orders">{t("myOrders")}</Link>
                        </li>

                        <li>
                          <button onClick={handleLogout} className="logout-btn">
                            {t("logout")}
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="sub-top">
                      <Link href={`/login`} className="tf-btn btn-reset">
                        {t("login")}
                      </Link>
                      <p className="text-center text-secondary-2">
                        {t("noAccount")}{" "}
                        <Link href={`/register`}>{t("register")}</Link>
                      </p>
                    </div>
                  )}

                </div>
              </li>
              {/* Wishlist - Hidden on mobile, visible on md+ for logged in users */}
              {user && (
                <li className="nav-wishlist d-none d-md-block">
                  <Link href={`/wish-list`} className="nav-icon-item" aria-label={t("wishlist") || "Wishlist"}>
                    <svg
                      className="icon"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M20.8401 4.60987C20.3294 4.09888 19.7229 3.69352 19.0555 3.41696C18.388 3.14039 17.6726 2.99805 16.9501 2.99805C16.2276 2.99805 15.5122 3.14039 14.8448 3.41696C14.1773 3.69352 13.5709 4.09888 13.0601 4.60987L12.0001 5.66987L10.9401 4.60987C9.90843 3.57818 8.50915 2.99858 7.05012 2.99858C5.59109 2.99858 4.19181 3.57818 3.16012 4.60987C2.12843 5.64156 1.54883 7.04084 1.54883 8.49987C1.54883 9.95891 2.12843 11.3582 3.16012 12.3899L4.22012 13.4499L12.0001 21.2299L19.7801 13.4499L20.8401 12.3899C21.3511 11.8791 21.7565 11.2727 22.033 10.6052C22.3096 9.93777 22.4519 9.22236 22.4519 8.49987C22.4519 7.77738 22.3096 7.06198 22.033 6.39452C21.7565 5.72706 21.3511 5.12063 20.8401 4.60987V4.60987Z"
                        stroke="#181818"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              )}
              {/* Cart - Always visible with prominent positioning */}
              <li className="nav-cart">
                <a
                  href="#shoppingCart"
                  data-bs-toggle="modal"
                  className="nav-icon-item d-flex align-items-center justify-content-center"
                  aria-label={t("cart") || "Shopping Cart"}
                >
                  <svg
                    className="icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M16.5078 10.8734V6.36686C16.5078 5.17166 16.033 4.02541 15.1879 3.18028C14.3428 2.33514 13.1965 1.86035 12.0013 1.86035C10.8061 1.86035 9.65985 2.33514 8.81472 3.18028C7.96958 4.02541 7.49479 5.17166 7.49479 6.36686V10.8734M4.11491 8.62012H19.8877L21.0143 22.1396H2.98828L4.11491 8.62012Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="count-box" aria-hidden="true">
                    <CartLength />
                  </span>
                </a>
              </li>
              {/* Language Selector - Hidden on mobile to save space  */}
              {/* <li className="nav-language d-none d-md-block">
                <LanguageSelect
                  topStart={true}
                  parentClassName="image-select center style-default type-languages"
                />
              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
