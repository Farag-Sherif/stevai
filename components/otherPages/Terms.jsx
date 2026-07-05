"use client";

import { getTermsAndConditions } from "@/api/main";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/react";

export default function Terms() {
  const locale = useLocale();

  const {
    data: terms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["termsAndConditions"],
    queryFn: getTermsAndConditions,
  });

  // Generate dynamic sections from API data - sort by ID to maintain proper order
  const sections =
    terms
      ?.sort((a, b) => a.id - b.id)
      .map((term, index) => {
        const translation =
          term.translations?.find((t) => t.locale === locale) ||
          term.translations?.find((t) => t.locale === "en") ||
          term;

        return {
          id: term.id,
          text: translation.title || term.title,
          scroll: `term-${term.id}`,
          termId: term.id,
          content: translation.content || term.content,
        };
      }) || [];

  const sectionIds = sections.map((section) => section.scroll);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    // Create an IntersectionObserver to track visibility of sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Update active section when the section is visible in the viewport
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px", // Trigger when section is 50% visible
      }
    );

    // Observe each section
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      // Cleanup the observer when the component unmounts
      observer.disconnect();
    };
  }, [sectionIds]);

  const handleClick = (id) => {
    document
      .getElementById(id)
      .scrollIntoView({ behavior: "smooth", block: "center" });
  };

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

  if (error || !terms?.length) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center">
            {locale === "ar"
              ? "خطأ في تحميل الشروط والأحكام"
              : "Error loading terms and conditions"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="terms-of-use-wrap">
          <div className="left sticky-top">
            {sections.map(({ id, text, scroll }) => (
              <h6
                key={id}
                onClick={() => handleClick(scroll)}
                className={`btn-scroll-target ${
                  activeSection === scroll ? "active" : ""
                }`}
              >
                {text}
              </h6>
            ))}
          </div>
          <div className="right">
            <h4 className="heading">
              {locale === "ar" ? "شروط الاستخدام" : "Terms of use"}
            </h4>
            {sections.map(({ id, text, scroll, content }) => (
              <div
                key={id}
                className="terms-of-use-item item-scroll-target"
                id={scroll}
              >
                <h5 className="terms-of-use-title">{text}</h5>
                <div className="terms-of-use-content">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
