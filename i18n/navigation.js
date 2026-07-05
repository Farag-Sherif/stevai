import React from "react";
import LinkBase from "@/router/Link";
import { redirect, stripLocaleFromPathname, usePathname as useRawPathname, useRouter } from "@/router/navigation";

export const Link = React.forwardRef(function Link(props, ref) {
  return React.createElement(LinkBase, { ref, ...props });
});

export function usePathname() {
  const pathname = useRawPathname();
  return stripLocaleFromPathname(pathname);
}

export function getPathname(pathname) {
  return stripLocaleFromPathname(pathname);
}

export { redirect, useRouter };
