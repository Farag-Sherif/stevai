"use client";
import React, { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/react";
import { useRouter, usePathname } from "@/i18n/navigation";

const languageOptions = [
  { id: "en", label: "English" },
  { id: "ar", label: "Arabic" },
];

// Globe/Earth SVG Icon Component
const GlobeIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export default function LanguageSelect({
  parentClassName = "image-select center style-default type-languages",
  topStart = false,
}) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Set the initial selected language based on current locale
  const [selected, setSelected] = useState(
    languageOptions.find((option) => option.id === currentLocale) ||
      languageOptions[0]
  );
  const [isDDOpen, setIsDDOpen] = useState(false);
  const languageSelect = useRef();

  // Update selected language when locale changes
  useEffect(() => {
    const newSelected = languageOptions.find(
      (option) => option.id === currentLocale
    );
    if (newSelected) {
      setSelected(newSelected);
    }
  }, [currentLocale]);

  // Handle language change
  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage.id !== currentLocale) {
      // Use the router to change locale while keeping the same path
      router.replace(pathname, { locale: newLanguage.id });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    setSelected(newLanguage);
    setIsDDOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageSelect.current &&
        !languageSelect.current.contains(event.target)
      ) {
        setIsDDOpen(false); // Close the dropdown if click is outside
      }
    };
    // Add the event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className={`dropdown bootstrap-select ${parentClassName}  dropup `}
        onClick={() => setIsDDOpen((pre) => !pre)}
        ref={languageSelect}
      >
        <select
          className="image-select center style-default type-languages"
          tabIndex="null"
        >
          {languageOptions.map((option, i) => (
            <option key={i} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          tabIndex={-1}
          className={`btn dropdown-toggle btn-light  ${
            isDDOpen ? "show" : ""
          } `}
        >
          <div className="filter-option">
            <div className="filter-option-inner">
              <div className="filter-option-inner-inner">
                <GlobeIcon className="globe-icon" />
              </div>
            </div>
          </div>
        </button>
        <div
          className={`dropdown-menu ${isDDOpen ? "show" : ""} `}
          style={{
            maxHeight: "899.688px",
            overflow: "hidden",
            minHeight: 0,
            position: "absolute",
            inset: topStart ? "" : "auto auto 0px -10px",
            margin: 0,
            transform: `translate(0px, ${topStart ? 22 : -20}px)`,
          }}
          data-popper-placement={`${!topStart ? "top" : "bottom"}-start`}
        >
          <div
            className="inner show"
            style={{
              maxHeight: "869.688px",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <ul
              className="dropdown-menu inner show"
              role="presentation"
              style={{ marginTop: 0, marginBottom: 0 }}
            >
              {languageOptions.map((elm, i) => (
                <li
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(elm);
                  }}
                  className={`selected ${
                    selected.id === elm.id ? "active" : ""
                  }`}
                >
                  <a
                    className={`dropdown-item ${
                      selected.id === elm.id ? "active selected" : ""
                    }`}
                  >
                    <span className="text">{elm.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
