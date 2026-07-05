"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "@/i18n/react";
import { Link, useRouter } from "@/i18n/navigation";
import { resetPassword } from "@/api/auth";
import toast from "react-hot-toast";
import { useSearchParams } from "@/router/navigation";

export default function ResetPass() {
  const locale = useLocale();
  const t = useTranslations("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get token and email from URL parameters (from email link)
  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Ensure we have email, password, password_confirmation, and token
    const email = formData.get("email") || emailFromUrl;
    const password = formData.get("password");
    const password_confirmation = formData.get("password_confirmation");
    const token = formData.get("token") || tokenFromUrl;

    // Validate passwords match
    if (password !== password_confirmation) {
      toast.error(
        locale === "ar"
          ? "كلمات المرور غير متطابقة"
          : "Passwords do not match"
      );
      setIsSubmitting(false);
      return;
    }

    // Create new FormData with correct field names
    const resetFormData = new FormData();
    resetFormData.append("email", email);
    resetFormData.append("password", password);
    resetFormData.append("password_confirmation", password_confirmation);
    resetFormData.append("token", token);

    try {
      const response = await resetPassword(resetFormData);
      if (response?.status === "success" || response?.status === "200") {
        toast.success(
          locale === "ar"
            ? "تم تعيين كلمة المرور الجديدة بنجاح"
            : "Password updated successfully"
        );
        e.currentTarget.reset();
        // Redirect to login after successful reset
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(
          response?.message ||
            (locale === "ar"
              ? "تعذر تحديث كلمة المرور، يرجى التحقق من البيانات"
              : "Could not update password, please check your details")
        );
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Reset password failed:", error);
      }
      toast.error(
        locale === "ar"
          ? "حدث خطأ أثناء تحديث كلمة المرور"
          : "An error occurred while updating the password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flat-spacing" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">{t("resetPasswordTitle")}</h4>
              <p>{t("resetPasswordDesc")}</p>
            </div>
            <form onSubmit={handleSubmit} className="form-login">
              <div className="wrap">
                <fieldset>
                  <input
                    className=""
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    name="email"
                    defaultValue={emailFromUrl || ""}
                    tabIndex={2}
                    required
                  />
                </fieldset>
                <fieldset>
                  <input
                    className=""
                    type="text"
                    placeholder={t("resetCodePlaceholder")}
                    name="token"
                    defaultValue={tokenFromUrl || ""}
                    tabIndex={3}
                    required
                  />
                </fieldset>
                <fieldset>
                  <input
                    className=""
                    type="password"
                    placeholder={t("newPasswordPlaceholder")}
                    name="password"
                    tabIndex={4}
                    minLength={8}
                    required
                  />
                </fieldset>
                <fieldset>
                  <input
                    className=""
                    type="password"
                    placeholder={t("confirmNewPasswordPlaceholder")}
                    name="password_confirmation"
                    tabIndex={5}
                    minLength={8}
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
                    {isSubmitting ? t("savingNewPassword") : t("saveNewPassword")}
                  </span>
                </button>
              </div>
              <div className="mt-3 text-center">
                <Link href="/login" style={{ color: "var(--main, #029465)" }}>
                  {t("backToLogin")}
                </Link>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("needHelpTitle")}</h4>
            <p className="text-secondary">{t("needHelpDesc")}</p>
            <Link href={`/forget-password`} className="tf-btn btn-fill">
              <span className="text text-button">{t("backToResetLink")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


