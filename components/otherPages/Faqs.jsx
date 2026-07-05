"use client";
import { getQuestions, sendContact } from "@/api/main";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Faqs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const locale = useLocale();

  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: () => getQuestions(),
  });

  const { mutate: sendContactMutation, isPending: isSubmitting } = useMutation({
    mutationFn: sendContact,
    onSuccess: () => {
      toast.success(
        locale === "ar" ? "تم إرسال الرسالة بنجاح" : "Message sent successfully"
      );
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    },
    onError: () => {
      toast.error(locale === "ar" ? "حدث خطأ ما" : "An error occurred");
    },
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const contactData = {
      name,
      email,
      subject,
      message,
    };

    sendContactMutation(contactData);
  };

  // Transform API data to get the correct translation based on current locale
  const getTranslatedFAQ = (faq) => {
    const translation =
      faq.translations?.find((t) => t.locale === locale) ||
      faq.translations?.[0];
    return {
      id: faq.id,
      title: translation?.title || faq.title,
      content: translation?.content || faq.content,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            {locale === "ar" ? "جاري التحميل..." : "Loading..."}
          </div>
        </div>
      </section>
    );
  }

  // Error or no data state
  if (error || !questions?.length) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            {locale === "ar"
              ? "لا توجد أسئلة متاحة حالياً"
              : "No FAQs available at the moment"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="page-faqs-wrap">
          <div className="list-faqs">
            <div>
              <h5 className="faqs-title">
                {locale === "ar"
                  ? "الأسئلة الشائعة"
                  : "Frequently Asked Questions"}
              </h5>
              <ul
                className="accordion-product-wrap style-faqs"
                id="accordion-faq-main"
              >
                {questions.map((faq, index) => {
                  const translatedFAQ = getTranslatedFAQ(faq);
                  const accordionId = `accordion-${faq.id}`;
                  const isFirstItem = index === 0;

                  return (
                    <li key={faq.id} className="accordion-product-item">
                      <a
                        href={`#${accordionId}`}
                        className={`accordion-title ${
                          isFirstItem ? "current" : "collapsed current"
                        }`}
                        data-bs-toggle="collapse"
                        aria-expanded={isFirstItem ? "true" : "false"}
                        aria-controls={accordionId}
                      >
                        <h6>{translatedFAQ.title}</h6>
                        <span className="btn-open-sub" />
                      </a>
                      <div
                        id={accordionId}
                        className={`collapse ${isFirstItem ? "show" : ""}`}
                        data-bs-parent="#accordion-faq-main"
                      >
                        <div className="accordion-faqs-content">
                          <p className="text-secondary">
                            {translatedFAQ.content}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="ask-question sticky-top">
            <div className="ask-question-wrap">
              <h5 className="mb_4">
                {locale === "ar" ? "اطرح سؤالك" : "Ask Your Question"}
              </h5>
              <p className="mb_20 text-secondary">
                {locale === "ar"
                  ? "اسأل عن أي شيء، نحن هنا لمساعدتك"
                  : "Ask Anything, We're Here to Help"}
              </p>
              <form className="form-leave-comment" onSubmit={handleSubmit}>
                <div className="wrap">
                  <div className="cols">
                    <fieldset className="mb_20">
                      <input
                        className=""
                        type="text"
                        placeholder={locale === "ar" ? "اسمك*" : "Your Name*"}
                        name="name"
                        tabIndex={1}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                    <fieldset className="mb_20">
                      <input
                        className=""
                        type="email"
                        placeholder={
                          locale === "ar" ? "بريدك الإلكتروني*" : "Your Email*"
                        }
                        name="email"
                        tabIndex={2}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-required="true"
                        required
                        disabled={isSubmitting}
                      />
                    </fieldset>
                  </div>
                  <fieldset className="mb_20">
                    <input
                      className=""
                      type="text"
                      placeholder={locale === "ar" ? "الموضوع*" : "Subject*"}
                      name="subject"
                      tabIndex={3}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      aria-required="true"
                      required
                      disabled={isSubmitting}
                    />
                  </fieldset>
                  <fieldset className="mb_20">
                    <textarea
                      className=""
                      rows={4}
                      placeholder={
                        locale === "ar" ? "رسالتك*" : "Your Message*"
                      }
                      name="message"
                      tabIndex={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      aria-required="true"
                      required
                      disabled={isSubmitting}
                    />
                  </fieldset>
                </div>
                <div className="button-submit">
                  <button
                    className="btn-style-2 w-100"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <span className="text text-button">
                      {isSubmitting
                        ? locale === "ar"
                          ? "جاري الإرسال..."
                          : "Sending..."
                        : locale === "ar"
                        ? "إرسال الطلب"
                        : "Send Request"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
