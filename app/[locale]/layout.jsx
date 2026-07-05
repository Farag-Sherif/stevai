import { NextIntlClientProvider, hasLocale } from "@/i18n/react";
import { notFound } from "@/router/navigation";
import { routing } from "@/i18n/routing";
import ModalsWrapper from "@/components/modals/ModalsWrapper";
import LocaleDocument from "@/components/providers/LocaleDocument";
import "@/styles/search-modal.css";
import { getMessages, setRequestLocale } from "@/i18n/server";

export const metadata = {
  title: "Stevia",
  description: "Stevia",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <LocaleDocument locale={locale} />
        <div id="wrapper">{children}</div>
        <ModalsWrapper />
      </NextIntlClientProvider>
    </main>
  );
}
