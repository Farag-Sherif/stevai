"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "@/i18n/react";
import { Link as IntlLink, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/store/userStore";
import { useAuthMutations } from "@/hooks/mutations/useAuthMutations";

export default function Register() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("register");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [password, setPassword] = useState("");
  const { fetchUser, user } = useUserStore();
  const { registerMutation, loginMutation } = useAuthMutations();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const isValidEgyptPhoneNumber = (value) => {
    if (!value) return false;
    const digitsOnly = String(value).replace(/\D/g, "");
    return /^(010|011|012|015)\d{8}$/.test(digitsOnly);
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push(t("passwordTooShort"));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t("passwordNoUppercase"));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t("passwordNoLowercase"));
    }

    if (!/[0-9]/.test(password)) {
      errors.push(t("passwordNoNumber"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(t("passwordNoSpecialChar"));
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("phone");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validate phone number (Egypt): must be 11 digits and start with 010, 011, 012, or 015
    if (!isValidEgyptPhoneNumber(phone)) {
      toast.error(t("invalidPhone"));
      return;
    }
    // Sanitize phone before submit (digits only)
    formData.set("phone", String(phone).replace(/\D/g, ""));

    // Validate password requirements
    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      passwordValidationErrors.forEach((error) => toast.error(error));
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    try {
      const response = await registerMutation.mutateAsync(formData);

      if (response.status === "error") {
        const fieldLabels = {
          fname: t("firstName"),
          lname: t("lastName"),
          email: t("email"),
          phone: t("phone"),
          password: t("password"),
          confirmPassword: t("confirmPassword"),
        };

        const collectErrorMessages = (res) => {
          const messages = [];
          const errors = res?.errors ?? res?.error ?? null;

          if (errors && typeof errors === "object") {
            Object.entries(errors).forEach(([key, value]) => {
              const label = fieldLabels[key] ?? key;
              if (Array.isArray(value)) {
                value.forEach((msg) => messages.push(`${label}: ${msg}`));
              } else if (typeof value === "string") {
                messages.push(`${label}: ${value}`);
              }
            });
          } else if (typeof errors === "string") {
            messages.push(errors);
          } else if (res?.message) {
            messages.push(res.message);
          }

          return messages;
        };

        const errorMessages = collectErrorMessages(response);
        if (errorMessages.length > 0) {
          errorMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(t("registrationFailed"));
        }
        return;
      }

      toast.success(t("registrationSuccessful"));
      try {
        if (response.token) {
          await fetchUser();
        } else {
          await loginMutation.mutateAsync(formData);
        }
      } finally {
        router.push("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(t("registrationFailed"));
      // Show error message
    }
  };

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      window.location.href = `/${locale}`;
    }
  }, [user, locale]);

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
                    type="text"
                    placeholder={t("firstName")}
                    name="fname"
                    tabIndex={1}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="text"
                    placeholder={t("lastName")}
                    name="lname"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="email"
                    placeholder={t("email")}
                    name="email"
                    tabIndex={3}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="">
                  <input
                    className=""
                    type="tel"
                    placeholder={t("phone")}
                    name="phone"
                    tabIndex={4}
                    defaultValue=""
                    aria-required="true"
                    inputMode="numeric"
                    maxLength={11}
                    title={t("invalidPhone")}
                    required
                  />
                </fieldset>
                <fieldset className="position-relative password-item">
                  <input
                    className="input-password"
                    type={passwordType}
                    placeholder={t("password")}
                    name="password"
                    tabIndex={5}
                    value={password}
                    onChange={handlePasswordChange}
                    aria-required="true"
                    required
                  />
                  <span
                    className={`toggle-password ${
                      !(passwordType === "text") ? "unshow" : ""
                    }`}
                    onClick={togglePassword}
                  >
                    <i
                      className={`icon-eye-${
                        !(passwordType === "text") ? "hide" : "show"
                      }-line`}
                    />
                  </span>
                </fieldset>
                {passwordErrors.length > 0 && (
                  <div className="password-requirements mt-2">
                    <small className="text-danger">
                      <strong>{t("passwordRequirements")}</strong>
                    </small>
                    <ul className="mt-1 mb-0 ps-3">
                      {passwordErrors.map((error, index) => (
                        <li key={index} className="text-danger small">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <fieldset className="position-relative password-item">
                  <input
                    className="input-password"
                    type={confirmPasswordType}
                    placeholder={t("confirmPassword")}
                    name="confirmPassword"
                    tabIndex={6}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                  <span
                    className={`toggle-password ${
                      !(confirmPasswordType === "text") ? "unshow" : ""
                    }`}
                    onClick={toggleConfirmPassword}
                  >
                    <i
                      className={`icon-eye-${
                        !(confirmPasswordType === "text") ? "hide" : "show"
                      }-line`}
                    />
                  </span>
                </fieldset>
                <div className="d-flex align-items-center">
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        defaultChecked
                        className=""
                        type="checkbox"
                        id="login-form_agree"
                        name="agree_checkbox"
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label
                      className="text-secondary-2"
                      htmlFor="login-form_agree"
                    >
                      {t("termsAgree")}&nbsp;
                    </label>
                  </div>
                  <IntlLink href={`/term-of-use`} title="Terms of Service">
                    {t("termsOfUse")}
                  </IntlLink>
                </div>
              </div>
              <div className="button-submit">
                <button className="tf-btn btn-fill" type="submit" disabled={registerMutation.isPending || loginMutation.isPending}>
                  <span className="text text-button">
                    {registerMutation.isPending ? t("registering") : t("registerButton")}
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">{t("alreadyHaveAccount")}</h4>
            <p className="text-secondary">{t("welcomeBack")}</p>
            <IntlLink href={`/login`} className="tf-btn btn-fill">
              <span className="text text-button">{t("loginButton")}</span>
            </IntlLink>
          </div>
        </div>
      </div>
    </section>
  );
}
