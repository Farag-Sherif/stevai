import { messagesByLocale } from "./messages";
import { routing } from "./routing";

export default async function requestConfig({ locale }) {
  const activeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  return {
    locale: activeLocale,
    messages: messagesByLocale[activeLocale] || messagesByLocale[routing.defaultLocale],
  };
}
