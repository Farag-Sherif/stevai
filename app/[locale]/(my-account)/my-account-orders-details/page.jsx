import { setRequestLocale } from "@/i18n/server";
import { redirect } from "@/router/navigation";

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "ar" }];
};

export default async function MyAccountOrdersDetailsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/my-account-orders`);
}
