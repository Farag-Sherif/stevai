import { useLocation, useNavigate, useParams as useReactRouterParams, useSearchParams as useReactRouterSearchParams } from "react-router-dom";

export const SUPPORTED_LOCALES = ["en", "ar"];
export const DEFAULT_LOCALE = "en";

export function extractLocaleFromPathname(pathname = "/") {
  const match = pathname.match(/^\/(en|ar)(?:\/|$)/);
  return match?.[1] || null;
}

export function stripLocaleFromPathname(pathname = "/") {
  const locale = extractLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";
  const stripped = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function isExternalHref(href = "") {
  return /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#");
}

export function applyLocaleToHref(href, locale = DEFAULT_LOCALE) {
  if (!href) return `/${locale}`;
  if (typeof href !== "string") return href;
  if (isExternalHref(href)) return href;

  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const [pathWithQuery, hash = ""] = href.split("#");
  const [pathname = "/", search = ""] = pathWithQuery.split("?");

  if (pathname === "/") {
    return `/${safeLocale}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
  }

  const localeMatch = pathname.match(/^\/(en|ar)(?=\/|$)/);
  const localizedPath = localeMatch
    ? pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${safeLocale}`)
    : pathname.startsWith("/")
      ? `/${safeLocale}${pathname}`
      : `/${safeLocale}/${pathname}`;

  return `${localizedPath}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useReactRouterSearchParams();
}

export function useParams() {
  return useReactRouterParams();
}

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentLocale = extractLocaleFromPathname(location.pathname) || DEFAULT_LOCALE;

  return {
    push(href, options = {}) {
      navigate(applyLocaleToHref(href, options.locale || currentLocale));
    },
    replace(href, options = {}) {
      navigate(applyLocaleToHref(href, options.locale || currentLocale), { replace: true });
    },
    back() {
      navigate(-1);
    },
    forward() {
      navigate(1);
    },
    refresh() {
      window.location.reload();
    },
    prefetch() {
      return Promise.resolve();
    },
  };
}

export function redirect(href) {
  const error = new Error("REDIRECT");
  error.name = "RedirectError";
  error.href = href;
  throw error;
}

export function notFound() {
  const error = new Error("NOT_FOUND");
  error.name = "NotFoundError";
  throw error;
}
