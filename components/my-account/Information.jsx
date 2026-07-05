"use client";
import React, { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useTranslations } from "@/i18n/react";
import toast from "react-hot-toast";
import { useProfileMutations } from "@/hooks/mutations/useProfileMutations";

export default function Information() {
  const { user, fetchUser, setUser } = useUserStore();
  const t = useTranslations("myAccount");
  const { updateProfileMutation, updatePasswordMutation } = useProfileMutations();

  // Form states
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [newPasswordType, setNewPasswordType] = useState("password");

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Initialize form with user data; preserve email if API does not return it (e.g. after update)
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        fname: user.fname || "",
        lname: user.lname || "",
        email: user.email || prev.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Toggle password visibility functions
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

  const toggleNewPassword = () => {
    setNewPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fname || !formData.lname || !formData.phone) {
      toast.error(t("fillAllFields"));
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const response = await updateProfileMutation.mutateAsync({
        fname: formData.fname,
        lname: formData.lname,
        phone: formData.phone,
        email: formData.email,
      });

      const ok =
        response?.status === "success" ||
        response?.success === true ||
        (response?.message && !response?.error && !response?.status);
      if (ok) {
        toast.success(t("updateSuccessful"));
      } else {
        const errMsg = response?.message || response?.error || t("updateFailed");
        toast.error(typeof errMsg === "string" ? errMsg : t("updateFailed"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t("updateFailed"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validate password fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error(t("fillAllFields"));
      return;
    }

    // Check if new passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await updatePasswordMutation.mutateAsync({
        password: passwordData.newPassword,
      });

      const ok =
        response?.status === "success" ||
        response?.success === true ||
        (response?.message && !response?.error);
      if (ok) {
        toast.success(t("passwordUpdateSuccessful"));
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errMsg = response?.message || response?.error || t("passwordUpdateFailed");
        toast.error(typeof errMsg === "string" ? errMsg : t("passwordUpdateFailed"));
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(t("passwordUpdateFailed"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="my-account-content">
      <div className="account-details">
        <form className="form-account-details form-has-password">
          <div className="account-info">
            <h5 className="title">{t("information")}</h5>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder={t("firstName")}
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
                  tabIndex={2}
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
                  value={formData.lname}
                  onChange={handleInputChange}
                  tabIndex={2}
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>
            <div className="cols mb_20">
              <fieldset className="">
                <input
                  className="disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                  type="email"
                  placeholder={t("email")}
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  tabIndex={2}
                  aria-required="true"
                  required
                  disabled
                />
              </fieldset>
              <fieldset className="">
                <input
                  className=""
                  type="text"
                  placeholder={t("phone")}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  tabIndex={2}
                  aria-required="true"
                  required
                />
              </fieldset>
            </div>

            <div className="button-submit">
              <button
                className="tf-btn btn-fill"
                type="submit"
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
              >
                <span className="text text-button">
                  {isUpdatingProfile ? t("updating") : t("updateAccount")}
                </span>
              </button>
            </div>
          </div>

          <div className="account-password">
            <h5 className="title">{t("changePassword")}</h5>
            <fieldset className="position-relative password-item mb_20">
              <input
                className="input-password"
                type={passwordType}
                placeholder={t("currentPassword")}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                tabIndex={2}
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
            <fieldset className="position-relative password-item mb_20">
              <input
                className="input-password"
                type={newPasswordType}
                placeholder={t("newPassword")}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                tabIndex={2}
                aria-required="true"
                required
              />
              <span
                className={`toggle-password ${
                  !(newPasswordType === "text") ? "unshow" : ""
                }`}
                onClick={toggleNewPassword}
              >
                <i
                  className={`icon-eye-${
                    !(newPasswordType === "text") ? "hide" : "show"
                  }-line`}
                />
              </span>
            </fieldset>
            <fieldset className="position-relative password-item">
              <input
                className="input-password"
                type={confirmPasswordType}
                placeholder={t("confirmPassword")}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                tabIndex={2}
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
            <div className="button-submit mt_20">
              <button
                className="tf-btn btn-fill"
                type="button"
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
              >
                <span className="text text-button">
                  {isUpdatingPassword ? t("updating") : t("changePassword")}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
