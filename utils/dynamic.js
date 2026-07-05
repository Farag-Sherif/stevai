import React, { Suspense } from "react";

export default function dynamic(loader, options = {}) {
  const LazyComponent = React.lazy(async () => {
    const mod = await loader();
    return { default: mod.default || mod };
  });

  const Loading = options.loading;

  return function DynamicComponent(props) {
    const fallback = Loading
      ? React.createElement(Loading, { isLoading: true, ...props })
      : null;

    return React.createElement(
      Suspense,
      { fallback },
      React.createElement(LazyComponent, props)
    );
  };
}
