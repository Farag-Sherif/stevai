"use client";
import React, { useRef, useState } from "react";
import { getSettings } from "@/api/main";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "@/router/navigation";
import { useTranslations } from "@/i18n/react";
import toast from "react-hot-toast";
import { useContactMutations } from "@/hooks/mutations/useContactMutations";

export default function Contact2() {
  const pathname = usePathname();
  const isArabic = typeof pathname === "string" && pathname.startsWith("/ar");
  const t = useTranslations("contact");
  const { contactMutation } = useContactMutations();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    try {
      const response = await contactMutation.mutateAsync(contactData);
      const ok =
        response?.status === "success" ||
        response?.success === true ||
        (response?.message && !response?.error);
      if (ok) {
        resetForm();
        toast.success(t("messageSentSuccess"));
      } else {
        const errMsg =
          response?.message ||
          response?.error ||
          (typeof response?.errors === "object"
            ? Object.values(response.errors).flat().join(", ")
            : t("somethingWentWrong"));
        toast.error(typeof errMsg === "string" ? errMsg : t("somethingWentWrong"));
      }
    } catch (err) {
      console.error("Error sending contact:", err);
      const errMsg = err?.message || t("somethingWentWrong");
      toast.error(typeof errMsg === "string" ? errMsg : t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flat-spacing">
        <div className="container">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flat-spacing">
        <div className="container">{t("errorLoading")}</div>
      </div>
    );
  }

  const phoneNumbers = settings?.mobiles || [];
  const emails = settings?.emails || [];
  const address = settings?.settings?.addresse || "";

  // Get localized content from settings
  const locale = isArabic ? "ar" : "en";
  const getLocalizedContent = (field) => {
    if (!settings?.settings?.translations)
      return settings?.settings?.[field] || "";

    const translation = settings.settings.translations.find(
      (tr) => tr.locale === locale
    );
    return translation?.[field] || settings.settings[field] || "";
  };

  return (
    <>
      <div
        style={{ height: "450px", width: "100%", border: 0 }}
        dangerouslySetInnerHTML={{
          __html: settings?.settings?.location_url,
        }}
      />
      <section className="flat-spacing" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="container">
          <div className="contact-us-content">
            <div className="left">
              <h4>{t("getInTouch")}</h4>
              <p className="text-secondary-2">{t("formDescription")}</p>
              <form
                onSubmit={handleSubmit}
                ref={formRef}
                id="contactform"
                className="form-leave-comment"
              >
                <div className="wrap">
                  <div className="cols">
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder={t("namePlaceholder")}
                        name="name"
                        id="name"
                        tabIndex={2}
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                    <fieldset className="">
                      <input
                        className=""
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        name="email"
                        id="email"
                        tabIndex={2}
                        value={email || ""}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder={t("subjectPlaceholder")}
                        name="subject"
                        id="subject"
                        tabIndex={2}
                        value={subject || ""}
                        onChange={(e) => setSubject(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                  </div>
                  <fieldset className="">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      placeholder={t("messagePlaceholder")}
                      tabIndex={2}
                      aria-required="true"
                      required
                      value={message || ""}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </fieldset>
                </div>
                <div className="button-submit send-wrap">
                  <button
                    className="tf-btn btn-fill"
                    type="submit"
                    disabled={contactMutation.isPending || isSubmitting}
                  >
                    <span className="text text-button">
                      {contactMutation.isPending || isSubmitting ? t("sending") : t("sendMessage")}
                    </span>
                  </button>
                </div>
              </form>
            </div>
            <div className="right">
              <h4>{t("information")}</h4>

              {phoneNumbers.length > 0 && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("phone")}:</div>
                  {phoneNumbers.map((phone, index) => {
                    // Get localized name for phone
                    const localizedName =
                      phone.translations?.find((t) => t.locale === locale)
                        ?.name || phone.name;
                    return (
                      <p key={phone.id || index} className="text-secondary">
                        {phone.mobile} ({localizedName})
                      </p>
                    );
                  })}
                </div>
              )}

              {emails.length > 0 && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("email")}:</div>
                  {emails.map((emailItem, index) => (
                    <p key={emailItem.id || index} className="text-secondary">
                      {emailItem.email}
                    </p>
                  ))}
                </div>
              )}

              {address && (
                <div className="mb_20">
                  <div className="text-title mb_8">{t("address")}:</div>
                  <p className="text-secondary">{address}</p>
                </div>
              )}

              {/* <div>
              <div className="text-title mb_8">Open Time:</div>
              <p className="mb_4 open-time">
                <span className="text-secondary">Mon - Sat:</span> 7:30am -
                8:00pm PST
              </p>
              <p className="open-time">
                <span className="text-secondary">Sunday:</span> 9:00am - 5:00pm
                PST
              </p>
            </div> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
