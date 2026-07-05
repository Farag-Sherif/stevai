import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { applyLocaleToHref, extractLocaleFromPathname, isExternalHref } from "@/router/navigation";

const Link = React.forwardRef(function Link(
  { href = "", locale, replace = false, prefetch, scroll, onClick, ...props },
  ref
) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const currentLocale = extractLocaleFromPathname(currentPath) || "en";
  const resolvedHref = typeof href === "string" ? applyLocaleToHref(href, locale || currentLocale) : href;

  if (typeof resolvedHref === "string" && isExternalHref(resolvedHref)) {
    return <a ref={ref} href={resolvedHref} onClick={onClick} {...props} />;
  }

  return <RouterLink ref={ref} to={resolvedHref} replace={replace} onClick={onClick} {...props} />;
});

export default Link;
