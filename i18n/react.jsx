import React, { createContext, useContext, useMemo, useCallback } from "react";
import { messagesByLocale } from "@/i18n/messages";

const I18nContext = createContext({ locale: "en", messages: messagesByLocale.en || {} });

function readNestedValue(source, path) {
  if (!path) return source;
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), source);
}

export function hasLocale(locales, locale) {
  return Array.isArray(locales) && locales.includes(locale);
}

export function I18nProvider({ children, locale = "en", messages }) {
  const value = useMemo(() => ({
    locale,
    messages: messages || messagesByLocale[locale] || messagesByLocale.en || {},
  }), [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function NextIntlClientProvider({ children, locale = "en", messages }) {
  return <I18nProvider locale={locale} messages={messages}>{children}</I18nProvider>;
}

export function useLocale() {
  return useContext(I18nContext).locale;
}


export function useTranslations(namespace) {
  const { messages } = useContext(I18nContext);

  return useCallback((key, variables) => {
    const base = namespace ? readNestedValue(messages, namespace) : messages;
    if (typeof key === "undefined") return base;
    let value = readNestedValue(base, key);
    if (typeof value === "string") {
      if (variables && typeof variables === "object") {
        Object.entries(variables).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return value;
    }
    if (typeof value === "number") return value;
    return key;
  }, [messages, namespace]);
}
