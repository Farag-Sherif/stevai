import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import GlobalNotFoundPage from "@/app/not-found";
import LocaleNotFoundPage from "@/app/[locale]/not-found";
import { applyLocaleToHref } from "@/router/navigation";

export default function AsyncPageRenderer({ Page, params }) {
  const location = useLocation();
  const [state, setState] = useState({ status: "loading", element: null, redirectTo: null, notFound: false, error: null });
  const depsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", element: null, redirectTo: null, notFound: false, error: null });

    Promise.resolve()
      .then(() => Page({ params }))
      .then((element) => {
        if (!active) return;
        setState({ status: "ready", element, redirectTo: null, notFound: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        if (error?.name === "RedirectError") {
          setState({ status: "redirect", element: null, redirectTo: error.href, notFound: false, error: null });
          return;
        }
        if (error?.name === "NotFoundError") {
          setState({ status: "notFound", element: null, redirectTo: null, notFound: true, error: null });
          return;
        }
        setState({ status: "error", element: null, redirectTo: null, notFound: false, error });
      });

    return () => {
      active = false;
    };
  }, [Page, depsKey]);

  if (state.redirectTo) {
    return <Navigate to={applyLocaleToHref(state.redirectTo, params?.locale || "en")} replace />;
  }

  if (state.notFound) {
    return params?.locale ? <LocaleNotFoundPage /> : <GlobalNotFoundPage />;
  }

  if (state.error) {
    throw state.error;
  }

  if (state.status === "loading") {
    return (
      <div className="page-content">
        <div className="container" style={{ paddingTop: 54, paddingBottom: 80, textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  return state.element;
}
