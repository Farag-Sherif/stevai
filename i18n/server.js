import { messagesByLocale } from "@/i18n/messages";

let currentRequestLocale = "en";

function getLocaleFromWindow() {
  if (typeof window === "undefined") return currentRequestLocale;
  const match = window.location.pathname.match(/^\/(en|ar)(?:\/|$)/);
  return match?.[1] || currentRequestLocale || "en";
}

function readNestedValue(source, path) {
  if (!path) return source;
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), source);
}

export function setRequestLocale(locale) {
  currentRequestLocale = locale || "en";
}

export async function getLocale() {
  return getLocaleFromWindow();
}

export async function getMessages({ locale } = {}) {
  const activeLocale = locale || getLocaleFromWindow();
  return messagesByLocale[activeLocale] || messagesByLocale.en || {};
}

export async function getTranslations(arg) {
  let locale = getLocaleFromWindow();
  let namespace;

  if (typeof arg === "string") {
    namespace = arg;
  } else if (arg && typeof arg === "object") {
    locale = arg.locale || locale;
    namespace = arg.namespace;
  }

  const messages = messagesByLocale[locale] || messagesByLocale.en || {};
  return (key) => {
    const base = namespace ? readNestedValue(messages, namespace) : messages;
    if (typeof key === "undefined") return base;
    const value = readNestedValue(base, key);
    if (typeof value === "string" || typeof value === "number") return value;
    return key;
  };
}

export function getRequestConfig(factory) {
  return factory;
}
