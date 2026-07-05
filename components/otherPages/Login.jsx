"use client";
import React, { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/i18n/react";
import { useAuthMutations } from "@/hooks/mutations/useAuthMutations";
import toast from "react-hot-toast";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/store/userStore";
import { cartStorage } from "@/utils/cartStorage";

export default function Login() {
  const t = useTranslations("login");
  const { setUser, user } = useUserStore();
  const router = useRouter();
  const didNavigateRef = useRef(false);
  const [passwordType, setPasswordType] = useState("password");
  const { loginMutation } = useAuthMutations();
  const locale = useLocale();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      // Read guest cart from localStorage before login
      const { items: localItems } = cartStorage.loadCart();
      const cartItems = (localItems || [])
        .map((item) => ({
          id: Number(item?.id ?? item?.item_id),
          quantity: Number(item?.quantity ?? item?.qty ?? 1) || 1,
          weight: String(item?.weight || ""),
        }))
        .filter((item) => item.id && Number.isFinite(item.id));

      // Login + sync guest cart to backend in ONE server call.
      // Keeps items added from guest mode when switching to user mode.
      const result = await loginMutation.mutateAsync({ formData, cartItems });

      if (result.login?.status !== "success") {
        toast.error(
          locale === "ar"
            ? "خطأ في رقم الهاتف أو كلمة المرور"
            : "Invalid phone number or password"
        );
        return;
      }

      if (result.user) setUser(result.user);

      // We already synced guest cart to backend on the server. Clear guest local carts
      // to avoid any double-adds after login.
      if (result.cartSync?.success && typeof window !== "undefined") {
        localStorage.removeItem("cart"); // legacy key
        cartStorage.clearCart();
      }

      didNavigateRef.current = true;
      toast.success(t("loginSuccessful"));
      if (typeof window !== "undefined") {
        window.location.href = `/${locale}`;
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(t("loginFailed"));
    }
  };

  useEffect(() => {
    if (user && !didNavigateRef.current && typeof window !== "undefined") {
      didNavigateRef.current = true;
      window.location.href = `/${locale}`;
    }
  }, [user, router, locale]);

  if (user) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-4">
          <p className="text-secondary mb-0">
            {locale === "ar" ? "جاري التحويل..." : "Redirecting..."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>{t("title")}</h4>
            </div>
            <form
              onSubmit={handleSubmit}
              className="form-login form-has-password"
            >
              <div className="wrap">
                <fieldset className="">
                  <input
                    className=""
                    type="tel"
                    placeholder={t("phone")}
                    name="phone"
                    tabIndex={1}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="position-relative password-item">
                  <input
                    className="input-password"
                    type={passwordType}
                    placeholder={t("password")}
                    name="password"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                  <span
                    className={`toggle-password ${!(passwordType === "text") ? "unshow" : ""
                      }`}
                    onClick={togglePassword}
                  >
                    <i
                      className={`icon-eye-${!(passwordType === "text") ? "hide" : "show"
                        }-line`}
                    />
                  </span>
                </fieldset>
                <div className="d-flex align-items-center justify-content-end mt-3">
                  <IntlLink
                    href={`/forget-password`}
                    className="font-2 text-button forget-password link"
                    style={{ color: "var(--primary, #e43131)" }}
                  >
                    {t("forgotPassword")}
                  </IntlLink>
                </div>
              </div>
              <div className="button-submit">
                <button className="tf-btn btn-fill" type="submit" disabled={loginMutation.isPending}>
                  <span className="text text-button">
                    {loginMutation.isPending
                      ? (locale === "ar" ? "جاري تسجيل الدخول..." : "Logging in...")
                      : t("loginButton")}
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("newCustomer")}</h4>
            <p className="text-secondary">{t("newCustomerDesc")}</p>
            <IntlLink href={`/register`} className="tf-btn btn-fill">
              <span className="text text-button">{t("registerButton")}</span>
            </IntlLink>
          </div>
        </div>
      </div>
    </section>
  );
}
