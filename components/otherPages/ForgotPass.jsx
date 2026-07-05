"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "@/i18n/react";
import { Link } from "@/i18n/navigation";
import { forgotPassword } from "@/api/auth";
import toast from "react-hot-toast";

export default function ForgotPass() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store form reference before async operations
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Ensure email field is present
    const email = formData.get("email");
    const emailString = email ? String(email).trim() : "";
    if (!emailString) {
      toast.error(
        locale === "ar"
          ? "يرجى إدخال البريد الإلكتروني"
          : "Please enter your email address"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await forgotPassword(formData);
      
      // Check if the response indicates an error
      if (response?.status === "error" || response?.error) {
        const errorMessage = 
          typeof response.error === "string" 
            ? response.error 
            : response?.message || t("resetError");
        toast.error(errorMessage);
      } else {
        // Success - show success message
        const successMessage = response?.message || 
          (locale === "ar"
            ? "تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
            : "Password reset code has been sent to your email");
        toast.success(successMessage);
        // Reset form safely using stored reference
        if (form && typeof form.reset === "function") {
          form.reset();
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Forgot password failed:", error);
      }
      toast.error(
        t("resetError") ||
        (locale === "ar"
          ? "حدث خطأ أثناء إرسال الكود"
          : "An error occurred while sending the code")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flat-spacing" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">{t("forgotPasswordTitle")}</h4>
              <p>{t("forgotPasswordDesc")}</p>
            </div>
            <form onSubmit={handleSubmit} className="form-login">
              <div className="wrap">
                <fieldset className="">
                  <input
                    className=""
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    name="email"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
              </div>
              <div className="button-submit">
                <button
                  className="tf-btn btn-fill"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span className="text text-button">
                    {isSubmitting ? t("sending") : t("submit")}
                  </span>
                </button>
              </div>
              <div className="mt-3 text-center">
                <Link
                  href="/login"
                  style={{ color: "var(--main, #029465)" }}
                >
                  {t("backToLogin")}
                </Link>
                <div className="mt-2">
                  <Link
                    href="/reset-password"
                    style={{ color: "var(--main, #029465)", fontSize: 14 }}
                  >
                    {locale === "ar"
                      ? "لديك كود؟ قم بتعيين كلمة المرور الآن"
                      : "Already have a code? Set your password now"}
                  </Link>
                </div>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("newCustomer")}</h4>
            <p className="text-secondary">{t("newCustomerDesc")}</p>
            <Link href={`/register`} className="tf-btn btn-fill">
              <span className="text text-button">{t("registerButton")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
